import 'package:v2/model/schedule_record.dart';

/// All schedule records of all terms for a single user.
class ScheduleRecords {
  /// Map from zhibei Lesson ID to [ScheduleRecord]s.
  final _bicwData = <int, ScheduleRecord>{};
  final _zhibeiData = <int, ScheduleRecord>{};

  /// Map from bicw course ID to [ScheduleRecord]s.
  final _rawBicwData = <int, ScheduleRecord>{};

  void addRecord(ScheduleRecord record, {bool zhibei = false}) {
    var map = zhibei ? _zhibeiData : _rawBicwData;
    map[record.course_id] = record;
  }

  void convertCourseIds(Map<int, int> courseIdMap) {
    for (var courseId in courseIdMap.keys) {
      var record = _rawBicwData[courseId];
      if (record != null) {
        _bicwData[courseIdMap[courseId]] = record;
      }
    }    
  }

  ScheduleRecord getRecord(int lessonId, {bool zhibei = false}) =>
      (zhibei ? _zhibeiData : _bicwData)[lessonId];
}
