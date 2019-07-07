import 'package:v2/model/report_grid.dart';
import 'package:v2/model/zb_jx_task_data.dart';
import 'package:v2/model/zb_task_data.dart';

class JxTaskGrid extends ReportGrid<JxTaskData> {
  JxTaskGrid() : super(1, 'jxWork_grid');

  /// Adds loaded task data to this grid.
  ///
  /// Note since `mantra_total` is not returned by the bicw server,
  /// the values are calculated before storing the data.
  @override
  void setTaskData(Map<int, Map<int, TaskData>> data, {bool zhibei = false}) {
    if (data.isEmpty) return;

    if (zhibei) {
      super.setTaskData(data, zhibei: true);
      return _setColumns(data.values.single);
    }

    var jxData = data as Map<int, Map<int, JxTaskData>>;

    var lastTerm = jxData.values.last;
    for (var halfTerm in jxData.values) {
      for (var user in halfTerm.values) {
        userIdMap[user.userID] = user.id;
        var last = lastTerm[user.id]..initTotal();
        last.baiziming_total += user.baiziming_count ?? 0;
        last.dingli_total += user.dingli_count ?? 0;
        last.faxin_total += user.faxin_count ?? 0;
        last.guiyi_total += user.guiyi_count ?? 0;
        last.lianshi_total += user.lianshi_count ?? 0;
        last.manza_total += user.manza_count ?? 0;
      }
    }
    for (var halfTerm in jxData.values) {
      for (var user in halfTerm.values) {
        var last = lastTerm[user.id];
        user.baiziming_total = last.baiziming_total;
        user.dingli_total = last.dingli_total;
        user.faxin_total = last.faxin_total;
        user.guiyi_total = last.guiyi_total;
        user.lianshi_total = last.lianshi_total;
        user.manza_total = last.manza_total;
      }
    }
    super.setTaskData(data);
  }

  /// Initialize columns set from zhibei.info task data.
  void _setColumns(Map<int, TaskData> halfTerm) {
    columns.clear();

    if (halfTerm.isEmpty) return;
    var map = halfTerm.values.first.toMap();
    columns.addAll(map.keys
        .where((key) => map[key] != null)
        .map((key) => key.split('_')[0]));
  }
}
