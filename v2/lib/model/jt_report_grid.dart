import 'package:v2/model/report_grid.dart';
import 'package:v2/model/zb_jt_task_data.dart';

class JtTaskGrid extends ReportGrid<JtTaskData> {
  @override
  final gridTypes = GridTypes(
      report_main_grid: 'jt_grid', attLimitGrid: 'fohao_att_limit_grid');

  JtTaskGrid(int classId, int pre_classID) : super(3, classId, pre_classID);
}
