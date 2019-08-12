import 'package:collection/collection.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/schedule_task_data.dart';
import 'package:v2/model/task_data_pair.dart';

import 'auditable.dart';
import 'has_schedule_records.dart';

class ScheduleTaskDataPair extends TaskDataPair<ScheduleTaskData> {
  bool limited;
  List<Lesson> lessons;

  @override
  TaskDataPair clone() => ScheduleTaskDataPair()
    ..bicwData = bicwData
    ..zhibeiData = zhibeiData
    ..audited = audited;

  @override
  void audit() {
    audited = ScheduleRecordsAuditor.audit(lessons, bicwData, zhibeiData,
        limited: limited);
  }

  /// Returns the [ScheduleRecord] for the [Lesson] identified by [lesson_id].
  ScheduleRecord getRecord(int lesson_id, {bool zhibei = false}) {
    var records = (zhibei ? zhibeiData : bicwData)?.scheduleRecords;
    return records == null ? null : records[lesson_id];
  }

  void convertCourseIds(Map<int, int> courseIdMap) {
    bicwData.buildScheduleRecords(courseIdMap);
  }
}

class ScheduleRecordsAuditor {
  static AuditState audit(List<Lesson> lessons, HasScheduleRecords bicwData,
      HasScheduleRecords zhibeiData,
      {bool limited}) {
    if (bicwData == null && zhibeiData == null) return null;

    var bicw = bicwData?.records ?? {};
    var zhibei = zhibeiData?.records ?? {};
    var emptyRecord = ScheduleRecord.fromJson({});

    var bicwRecords =
        lessons.map((lesson) => bicw[lesson.lesson_id] ?? emptyRecord).toList();
    var zhibeiRecords = lessons
        .map((lesson) => zhibei[lesson.lesson_id] ?? emptyRecord)
        .toList();

    bool isNotEmpty(record) => record.isNotEmpty;
    var hasLocalData =
        limited && (bicwData?.att ?? 0) != 0 || bicwRecords.any(isNotEmpty);
    var hasRemoteData =
        limited && (zhibeiData?.att ?? 0) != 0 || zhibeiRecords.any(isNotEmpty);

    if (hasLocalData && hasRemoteData) {
      if (limited && (bicwData?.att ?? 0) != (zhibeiData?.att ?? 0)) {
        return AuditState.FAIL;
      } else if (ListEquality<AbstractScheduleRecord>()
          .equals(bicwRecords, zhibeiRecords)) {
        return AuditState.PASS;
      } else {
        return AuditState.FAIL;
      }
    } else if (hasLocalData && !hasRemoteData) {
      return AuditState.LOCAL_ONLY;
    } else if (!hasLocalData && hasRemoteData) {
      return AuditState.REMOTE_ONLY;
    } else {
      return AuditState.PASS;
    }
  }
}
