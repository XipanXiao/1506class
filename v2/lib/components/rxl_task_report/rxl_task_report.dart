import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/components/abstract_task_report/abstract_task_att_limit_grid.dart';
import 'package:v2/components/abstract_task_report/schedule_records_loader.dart';
import 'package:v2/components/schedule_grid/schedule_grid.dart';
import 'package:v2/model/auditable.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/rxl_report_grid.dart';
import 'package:v2/model/zb_rxl_task_data.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/zb_service.dart';

@Component(
  selector: 'rxl-task-report',
  directives: [
    coreDirectives,
    MaterialButtonComponent,
    MaterialCheckboxComponent,
    MaterialIconComponent,
    ScheduleGridComponent,
  ],
  templateUrl: 'rxl_task_report.html',
  exports: [AuditState],
)
class RxlTaskReportComponent extends TaskAttLImitGridComponent<RxlTaskData> {
  RxlTaskReportComponent(
      ZBService zbService, TaskRecordService taskService, ScheduleRecordsLoader loader)
      : super(zbService, taskService, loader);

  @override
  RxlTaskData createTaskData(Map<String, dynamic> map) =>
      RxlTaskData.fromJson(map);

  @override
  ReportGrid<RxlTaskData> createTaskGrid(int classId, int pre_classID) =>
      RxlTaskGrid(classId, pre_classID);
}
