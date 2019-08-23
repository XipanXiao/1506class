import 'package:v2/model/report_grid.dart';
import 'package:v2/model/zb_rxl_task_data.dart';

class RxlTaskGrid extends ReportGrid<RxlTaskData> {
  @override
  final gridTypes =
      GridTypes(report_main_grid: 'rxl_grid', workGrid: 'rxl_work_grid');

  RxlTaskGrid(int classId, int pre_classID) : super(2, classId, pre_classID);

  @override
  void computeTotals() {
    var users = <int, RxlTaskData>{};
    for (var halfTerm in taskData.values) {
      for (var user in halfTerm.values) {
        if (user.bicwData == null) continue;
        users[user.bicwData.id] = user.bicwData;
      }
    }

    for (var halfTerm in taskData.values) {
      for (var pair in halfTerm.values) {
        var user = pair.bicwData;
        if (user == null) continue;
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
        if (user == null) continue;
        user.mantra_total = users[user.id].mantra_total;
      }
    }
  }
}
