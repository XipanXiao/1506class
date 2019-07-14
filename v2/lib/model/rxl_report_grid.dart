import 'package:v2/model/report_grid.dart';
import 'package:v2/model/zb_rxl_task_data.dart';

class RxlTaskGrid extends ReportGrid<RxlTaskData> {
  @override
  final gridTypes =
      GridTypes(report_main_grid: 'rxl_grid', workGrid: 'rxl_work_grid');

  RxlTaskGrid() : super(2);

  @override
  void computeTotals() {
    var users = <int, RxlTaskData>{};
    for (var halfTerm in taskData.values) {
      for (var user in halfTerm.values) {
        users[user.bicwData?.id] = user.bicwData;
      }
    }

    for (var halfTerm in taskData.values) {
      for (var pair in halfTerm.values) {
        var user = pair.bicwData;
        var last = users[user.id];

        userIdMap[user.userID] = user.id;
        last
          ..initTotal()
          ..mantra_total += user.mantra_count ?? 0;
      }
    }
    for (var halfTerm in taskData.values) {
      for (var pair in halfTerm.values) {
        var user = pair.bicwData;
        user.mantra_total = users[user.id].mantra_total;
      }
    }
  }
}
