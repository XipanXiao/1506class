import 'package:v2/model/report_grid.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/zb_jx_task_data.dart';

class JxTaskGrid extends ReportGrid<JxTaskData> {
  @override
  final gridTypes = GridTypes(
      report_main_grid: 'jx_grid',
      workGrid: 'jxWork_grid',
      attLimitGrid: 'att_limit_grid');

  JxTaskGrid() : super(1);

  @override
  void computeTotals() {
    var users = <int, JxTaskData>{};
    for (var halfTerm in taskData.values) {
      for (var user in halfTerm.values) {
        users[user.bicwData?.id] = user.bicwData;
      }
    }

    for (var halfTerm in taskData.values) {
      for (var pair in halfTerm.values) {
        var user = pair.bicwData;
        if (user == null) continue;

        var last = users[user.id];
        last
          ..initTotal()
          ..baiziming_total += user.baiziming_count ?? 0
          ..dingli_total += user.dingli_count ?? 0
          ..faxin_total += user.faxin_count ?? 0
          ..guiyi_total += user.guiyi_count ?? 0
          ..lianshi_total += user.lianshi_count ?? 0
          ..manza_total += user.manza_count ?? 0;
      }
    }
    for (var halfTerm in taskData.values) {
      for (var pair in halfTerm.values) {
        var user = pair.bicwData;
        if (user == null) continue;

        var last = users[user.id];
        user
          ..baiziming_total = last.baiziming_total
          ..dingli_total = last.dingli_total
          ..faxin_total = last.faxin_total
          ..guiyi_total = last.guiyi_total
          ..lianshi_total = last.lianshi_total
          ..manza_total = last.manza_total;
      }
    }
  }

  /// Initialize columns set from zhibei.info task data.
  void setColumns(int halfTerm) {
    columns.clear();

    var data = taskData[halfTerm];
    if (data.isEmpty) return;

    var user = data.values
        .firstWhere((user) => user.zhibeiData != null, orElse: () => null);
    if (user == null) return;

    var map = user.zhibeiData.toMap();
    columns.addAll(map.keys
        .where((key) => key.endsWith('_count') && map[key] != null)
        .map((key) => key.split('_')[0]));
  }
}
