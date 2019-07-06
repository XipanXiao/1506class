import 'package:v2/model/zb_task_data.dart';

class RxlTaskData extends TaskData {
  final int operation;
  final int select_all;

  final int user_style;

  int gx_count;
  double gx_time;
  int mantra_count;
  int mantra_total;

  RxlTaskData({
    int id,
    int userID,
    String name,
    int att,
    this.gx_count,
    this.gx_time,
    this.mantra_count,
    this.mantra_total,
    this.operation,
    this.select_all,
    this.user_style,
  }) : super(id: id, userID: userID, name: name, att: att);

  RxlTaskData.fromJson(Map<String, dynamic> map)
      : gx_count = map['gx_count'] ?? 0,
        gx_time = map['gx_time'] ?? 0,
        mantra_count = map['mantra_count'] ?? 0,
        mantra_total = map['mantra_total'] ?? 0,
        operation = int.tryParse(map['operation'] ?? ''),
        select_all = int.tryParse(map['select_all'] ?? ''),
        user_style = int.tryParse(map['user_style'] ?? ''),
        super.fromJson(map);

  @override
  bool operator ==(that) {
    if (that is! RxlTaskData) return false;
    var data = that as RxlTaskData;
    return att == data.att &&
        gx_count == data.gx_count &&
        gx_time == data.gx_time &&
        mantra_count == data.mantra_count;
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
}
