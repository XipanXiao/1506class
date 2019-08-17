import 'package:v2/model/schedule_task_data.dart';
import 'package:v2/model/zb_task_data.dart';

/// Jingtu data retrieved from zhibei.info.
///
/// Example: {
///   att: 0,
///   fohao_count: 0
///   fohao_total: 6719000
///   fohao_type: "0" //汉文
///   name: "张三",
///   operation: "0",
///   userID: "123623",
///   user_style: "0",
/// }
class JtTaskData extends ScheduleTaskData {
  int fohao_count;
  int fohao_total;
  final int fohao_type;

  JtTaskData.fromJson(Map<String, dynamic> map)
      : fohao_count = map['fohao_count'],
        fohao_total = map['fohao_total'],
        fohao_type = int.parse(map['fohao_type'] ?? '0'),
        super.fromJson(map);

  @override
  bool operator ==(that) {
    if (that is! JtTaskData) return false;
    var data = that as JtTaskData;
    return (fohao_count ?? 0) == (data.fohao_count ?? 0) &&
        (fohao_type ?? 0) == (data.fohao_type ?? 0);
  }

  @override
  Map<String, String> toMap() {
    var map = <String, String>{
      'fohao_count': fohao_count?.toString(),
      'fohao_type': fohao_type?.toString(),
    };
    return map..addAll(super.toMap());
  }

  @override
  bool get isEmpty =>
      fohao_count == null || fohao_count == 0;

  @override
  void initTotal() {
    fohao_total ??= 0;
  }

  bool _checkTotal(int a, int b) => a == null || b == null || a == b;

  @override
  bool sameTotal(TaskData that) {
    var data = that as JtTaskData;
    return _checkTotal(fohao_total, data.fohao_total);
  }
}
