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
      return super.setTaskData(data, zhibei: true);
    }

    var rxlData = data as Map<int, Map<int, JxTaskData>>;

    var lastTerm = rxlData.values.last;
    for (var halfTerm in rxlData.values) {
      for (var user in halfTerm.values) {
        userIdMap[user.userID] = user.id;
        lastTerm[user.id].baiziming_total += user.baiziming_count;
        lastTerm[user.id].dingli_total += user.dingli_count;
        lastTerm[user.id].faxin_total += user.faxin_count;
        lastTerm[user.id].guiyi_total += user.guiyi_count;
        lastTerm[user.id].lianshi_total += user.lianshi_count;
        lastTerm[user.id].manza_total += user.manza_count;
      }
    }
    for (var halfTerm in rxlData.values) {
      for (var user in halfTerm.values) {
        user.baiziming_total = lastTerm[user.id].baiziming_total;
        user.dingli_total = lastTerm[user.id].dingli_total;
        user.faxin_total = lastTerm[user.id].faxin_total;
        user.guiyi_total = lastTerm[user.id].guiyi_total;
        user.lianshi_total = lastTerm[user.id].lianshi_total;
        user.manza_total = lastTerm[user.id].manza_total;
      }
    }
    super.setTaskData(data);
  }
}
