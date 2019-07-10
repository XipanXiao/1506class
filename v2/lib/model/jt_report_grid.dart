import 'package:v2/model/report_grid.dart';
import 'package:v2/model/zb_task_data.dart';

class JxTaskGrid extends ReportGrid<TaskData> {
  @override
  final gridTypes = GridTypes(
      report_main_grid: 'jt_grid', attLimitGrid: 'fohao_att_limit_grid');

  JxTaskGrid() : super(3);
}
