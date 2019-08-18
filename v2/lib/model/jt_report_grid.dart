import 'package:v2/model/report_grid.dart';
import 'package:v2/model/zb_jt_task_data.dart';

class JtTaskGrid extends ReportGrid<JtTaskData> {
  @override
  final gridTypes = GridTypes(
      report_main_grid: 'jt_grid', attLimitGrid: 'fohao_att_limit_grid');

  JtTaskGrid(int classId, int pre_classID) : super(3, classId, pre_classID);

  @override
  void computeTotals() {
    var users = <int, JtTaskData>{};
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
          ..fohao_total += user.fohao_count ?? 0;
      }
    }
    for (var halfTerm in taskData.values) {
      for (var pair in halfTerm.values) {
        var user = pair.bicwData;
        user.fohao_total = users[user.id].fohao_total;
      }
    }
  }
}
