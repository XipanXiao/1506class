import 'package:v2/model/report_grid.dart';
import 'package:v2/model/zb_rxl_task_data.dart';
import 'package:v2/model/zb_task_data.dart';

class RxlTaskGrid extends ReportGrid<RxlTaskData> {
  RxlTaskGrid() : super(2, 'rxl_work_grid');

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

    var rxlData = data as Map<int, Map<int, RxlTaskData>>;

    var lastTerm = rxlData.values.last;
    for (var halfTerm in rxlData.values) {
      for (var user in halfTerm.values) {
        userIdMap[user.userID] = user.id;
        lastTerm[user.id].initTotal();
        lastTerm[user.id].mantra_total += user.mantra_count ?? 0;
      }
    }
    for (var halfTerm in rxlData.values) {
      for (var user in halfTerm.values) {
        user.mantra_total = lastTerm[user.id].mantra_total;
      }
    }
    super.setTaskData(data);
  }
}
