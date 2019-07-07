import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/components/abstract_task_report/abstract_task_report.dart';
import 'package:v2/model/jx_report_grid.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/zb_jx_task_data.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/zb_service.dart';

@Component(
  selector: 'jx-task-report',
  directives: [
    coreDirectives,
    MaterialButtonComponent,
    MaterialCheckboxComponent,
    MaterialIconComponent,
  ],
  templateUrl: 'jx_task_report.html',
)
class JxTaskReportComponent extends AbstractTaskReportComponent<JxTaskData> {
  JxTaskReportComponent(ZBService zbService, TaskRecordService taskService)
      : super(zbService, taskService);

  @override
  JxTaskData createTaskData(Map<String, dynamic> map) =>
      JxTaskData.fromJson(map);

  @override
  ReportGrid<JxTaskData> createTaskGrid() => JxTaskGrid();
}
