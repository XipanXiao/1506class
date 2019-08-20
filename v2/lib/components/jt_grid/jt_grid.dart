import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/components/abstract_task_report/abstract_task_att_limit_grid.dart';
import 'package:v2/components/abstract_task_report/schedule_records_loader.dart';
import 'package:v2/components/schedule_grid/schedule_grid.dart';
import 'package:v2/model/auditable.dart';
import 'package:v2/model/jt_report_grid.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/zb_jt_task_data.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/zb_service.dart';

@Component(
  selector: 'jt-grid',
  directives: [
    coreDirectives,
    MaterialButtonComponent,
    MaterialCheckboxComponent,
    MaterialIconComponent,
    ScheduleGridComponent,
  ],
  templateUrl: 'jt_grid.html',
  exports: [AuditState],
)
class JtGridComponent extends TaskAttLImitGridComponent<JtTaskData> {
  JtGridComponent(ZBService zbService, TaskRecordService taskService,
      ScheduleRecordsLoader loader)
      : super(zbService, taskService, loader);

  @override
  JtTaskData createTaskData(Map<String, dynamic> map) =>
      JtTaskData.fromJson(map);

  @override
  ReportGrid<JtTaskData> createTaskGrid(int classId, int pre_classID) =>
      JtTaskGrid(classId, pre_classID);
}
