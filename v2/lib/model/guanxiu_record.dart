import 'package:v2/model/has_schedule_records.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/schedule_auditor.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/zb_task_data.dart';

/// Model class for the 'schedule_records' database table.
class GuanxiuRecord extends TaskData implements HasScheduleRecords {
  /// Map from zhibei [Lesson] id to [GuanxiuData], for
  /// a certain user of a certain half term.
  final Map<int, GuanxiuData> guanxiu;

  GuanxiuRecord.fromJson(Map<String, dynamic> map, Iterable<Lesson> lessons)
      : guanxiu = _parseGuanxiuData(map, lessons),
        super.fromJson(map);

  static Map<int, GuanxiuData> _parseGuanxiuData(
      Map<String, dynamic> map, Iterable<Lesson> lessons) {
    return Map.fromIterable(lessons,
        key: (lesson) => lesson.lesson_id,
        value: (lesson) {
          var id = lesson.lesson_id;
          return GuanxiuData(id, map['count$id'], map['time$id']);
        });
  }

  @override
  Map<int, AbstractScheduleRecord> get records => guanxiu;
}

class GuanxiuData implements AbstractScheduleRecord {
  final int student_id;
  final int lesson_id;
  final int count;
  final double time;
  GuanxiuData(this.lesson_id, this.count, this.time, {this.student_id});

  GuanxiuData.empty({this.lesson_id, this.count, this.time, this.student_id});

  GuanxiuData.fromJson(Map<String, dynamic> map)
      : count = int.parse(map['count']),
        time = map['duration'],
        student_id = int.parse(map['student_id']),
        lesson_id = int.parse(map['sub_index']) + 1;

  @override
  bool get isNotEmpty => (count ?? 0) > 0 || (time ?? 0.0) > 0.0;

  @override
  int get hashCode => count * 1000 + time.round();

  @override
  bool operator ==(that) {
    if (that is! GuanxiuData) return false;
    return count == that.count && time == that.time;
  }
}

class GuanxiuTaskDataPair extends TaskDataPair<GuanxiuRecord> {
  List<Lesson> lessons;

  @override
  TaskDataPair clone() => GuanxiuTaskDataPair()
    ..bicwData = bicwData
    ..zhibeiData = zhibeiData
    ..audited = audited;

  @override
  void audit() {
    audited = ScheduleRecordsAuditor.audit(
        lessons, bicwData, zhibeiData, GuanxiuData.empty());
  }
}
