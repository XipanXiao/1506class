import 'package:v2/model/schedule_task_data.dart';
import 'package:v2/model/zb_task_data.dart';

class RxlTaskData extends ScheduleTaskData {
  int gx_count;
  double gx_time;
  int mantra_count;
  int mantra_total;

  RxlTaskData.fromJson(Map<String, dynamic> map)
      : gx_count = map['gx_count'],
        gx_time = map['gx_time'],
        mantra_count = map['mantra_count'],
        mantra_total = map['mantra_total'],
        super.fromJson(map);

  @override
  bool operator ==(that) {
  if (!(super == that)) return false;
  
    if (that is! RxlTaskData) return false;
    var data = that as RxlTaskData;
    return (att ?? 0) == (data.att ?? 0) &&
        (gx_count ?? 0) == (data.gx_count ?? 0) &&
        (gx_time ?? 0) == (data.gx_time ?? 0) &&
        (mantra_count ?? 0) == (data.mantra_count ?? 0);
  }

  @override
  Map<String, String> toMap() {
    var map = <String, String>{
      'gx_count': gx_count?.toString(),
      'gx_time': gx_time?.toString(),
      'mantra_count': mantra_count?.toString(),
    };
    return map..addAll(super.toMap());
  }

  @override
  bool get isEmpty =>
      (gx_count == null || gx_count == 0) &&
      (mantra_count == null || mantra_count == 0) &&
      super.isEmpty;

  @override
  bool get isNotEmpty => !isEmpty;

  @override
  void initTotal() {
    mantra_total ??= 0;
  }

  bool _checkTotal(int a, int b) => a == null || b == null || a == b;

  @override
  bool sameTotal(TaskData that) {
    var data = that as RxlTaskData;
    return _checkTotal(mantra_total, data.mantra_total);
  }
}
