import 'package:v2/model/schedule_record.dart';

/// All schedule records of all terms for a single user.
class ScheduleRecords {
  final bicwData = <int, ScheduleRecord>{};
  final zhibeiData = <int, ScheduleRecord>{};

  void addRecord(ScheduleRecord record, {bool zhibei = false}) {
    var map = zhibei ? zhibeiData : bicwData;
    map[record.course_id] = record;
  }
}
