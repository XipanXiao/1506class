import 'package:v2/model/guanxiu_record.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/task_data_pair.dart';

class GuanxiuDataPair extends TaskDataPair<GuanxiuRecord> {
  List<Lesson> lessons;

  @override
  TaskDataPair clone() => GuanxiuDataPair()
    ..bicwData = bicwData
    ..zhibeiData = zhibeiData
    ..audited = audited;

  @override
  void audit({bool compareAtt = false}) {
    bicwData?.lessons = lessons;
    zhibeiData?.lessons = lessons;
    super.audit();
  }

  /// Returns the [GuanxiuData] for the [Lesson] identified by [lesson_id].
  GuanxiuData getRecord(int lesson_id, {bool zhibei = false}) {
    var records = (zhibei ? zhibeiData : bicwData)?.guanxiu;
    return records == null ? null : records[lesson_id];
  }
}
