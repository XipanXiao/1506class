import 'package:collection/collection.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/schedule_task_data.dart';
import 'package:v2/model/task_data_pair.dart';

import 'auditable.dart';

class ScheduleTaskDataPair extends TaskDataPair<ScheduleTaskData> {
  List<bool> _expand(ScheduleRecord record) =>
      [record?.text ?? false, record?.video ?? false];

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

    var bicwRecords =
        lessons.expand((lesson) => _expand(bicw[lesson.lesson_id])).toList();
    var zhibeiRecords =
        lessons.expand((lesson) => _expand(zhibei[lesson.lesson_id])).toList();

    bool isTrue(bool value) => value;
    var hasLocalData =
        bicwRecords.any(isTrue) || limited && (bicwData?.att ?? 0) != 0;
    var hasRemoteData =
        zhibeiRecords.any(isTrue) || limited && (zhibeiData?.att ?? 0) != 0;

    if (hasLocalData && hasRemoteData) {
      if (limited && (bicwData?.att ?? 0) != (zhibeiData?.att ?? 0)) {
        audited = AuditState.FAIL;
      } else if (ListEquality<bool>().equals(bicwRecords, zhibeiRecords)) {
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
