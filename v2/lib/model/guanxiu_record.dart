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
  final int lesson_id;
  final int count;
  final double time;
  GuanxiuData(this.lesson_id, this.count, this.time);

  GuanxiuData.empty({this.lesson_id, this.count, this.time});

  @override
  bool get isNotEmpty => (count ?? 0) > 0 || (time ?? 0.0) > 0.0;
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
