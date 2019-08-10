import 'package:collection/collection.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/schedule_task_data.dart';
import 'package:v2/model/task_data_pair.dart';

import 'auditable.dart';

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
    audited = null;
    if (bicwData == null && zhibeiData == null) return;

    var bicw = bicwData?.scheduleRecords ?? {};
    var zhibei = zhibeiData?.scheduleRecords ?? {};
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
        audited = AuditState.FAIL;
      } else if (ListEquality<ScheduleRecord>()
          .equals(bicwRecords, zhibeiRecords)) {
        audited = AuditState.PASS;
      } else {
        audited = AuditState.FAIL;
      }
    } else if (hasLocalData && !hasRemoteData) {
      audited = AuditState.LOCAL_ONLY;
    } else if (!hasLocalData && hasRemoteData) {
      audited = AuditState.REMOTE_ONLY;
    } else {
      audited = AuditState.PASS;
    }
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
