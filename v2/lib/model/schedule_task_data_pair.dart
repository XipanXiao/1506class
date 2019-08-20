import 'package:v2/model/lesson.dart';
import 'package:v2/model/schedule_auditor.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/schedule_task_data.dart';
import 'package:v2/model/task_data_pair.dart';

class ScheduleTaskDataPair<T extends ScheduleTaskData> extends TaskDataPair<T> {
  bool limited;
  List<Lesson> lessons;

  @override
  TaskDataPair clone() => ScheduleTaskDataPair()
    ..bicwData = bicwData
    ..zhibeiData = zhibeiData
    ..audited = audited;

  @override
  void audit() {
    audited = ScheduleRecordsAuditor.audit(
        lessons, bicwData, zhibeiData, ScheduleRecord.fromJson({}),
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
