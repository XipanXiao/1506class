import 'package:v2/model/zb_task_data.dart';

class RxlTaskData extends TaskData {
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
    super.isEmpty &&
    (gx_count == null || gx_count == 0) &&
    (mantra_count == null || mantra_count == 0);

  @override
  void initTotal() {
    mantra_total ??= 0;
  }

  @override
  bool sameTotal(TaskData that) {
    var data = that as RxlTaskData;
    return mantra_total == data.mantra_total;
  }
}
