import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/zb_task_data.dart';

/// Base structure to encode/decode zhibei.info task data.
class ScheduleTaskData extends TaskData {
  /// Schedule task records, keyed by zhibei [Lesson] IDs.
  final scheduleRecords = <int, ScheduleRecord>{};

  /// Schedule task records, keyed by bicw [Course] IDs.
  final _scheduleRecords = <int, ScheduleRecord>{};

  ScheduleTaskData.fromJson(Map<String, dynamic> map) : super.fromJson(map);

  @override
  TaskData clone() {
    return ScheduleTaskData.fromJson({
      'id': id,
      'userID': userID,
      'name': name,
      'att': att
    });
  }

  /// Stores the bicw schedule [record] at the [_scheuleRecords]
  /// map.
  void addBicwScheduleRecord(ScheduleRecord record) {
    _scheduleRecords[record.course_id] = record;
  }

  /// Rebuilds the map of bicw schedule records, to use
  /// zhibei [Lesson] ID's as keys, instead of bicw [Course]
  /// ID's, using the [courseIdMap].
  void buildScheduleRecords(Map<int, int> courseIdMap) {
    for (var courseId in courseIdMap.keys) {
      var record = _scheduleRecords[courseId];
      if (record != null) {
        scheduleRecords[courseIdMap[courseId]] = record;
      }
    }
  }
}