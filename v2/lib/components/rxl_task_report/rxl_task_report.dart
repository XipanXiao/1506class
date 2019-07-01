import 'package:angular/angular.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/model/class_info.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/zb_service.dart';

@Component(
  selector: 'rxl-task-report',
  directives: [
    coreDirectives,
    MaterialIconComponent,
  ],
  templateUrl: 'rxl_task_report.html',
  styleUrls: ['rxl_task_report.css'],
)
class RxlTaskReportComponent {
  final ZBService _zbService;
  final TaskRecordService _taskService;

  final grid = RxlTaskGrid();

  @Input()
  set classInfo(ClassInfo classInfo) {
    if (classInfo == null || classInfo == _classInfo) return;
    _classInfo = classInfo;
    _reload();
  }

  ClassInfo _classInfo;
  RxlTaskReportComponent(this._zbService, this._taskService);

  void _reload() async {
    grid
      ..pre_classID = _classInfo.zb_id
      ..half_term = _classInfo.half_term
      ..taskData.clear();
    var taskData = await _taskService.getRxlTaskRecords(
        _classInfo.id, grid.grid_type, grid.half_term);
    grid.taskData.addAll(taskData);
    if (await _zbService.ensureAuthenticated()) {
      grid.zbTaskData
          .addAll(await _zbService.getRxlTaskData(grid.taskDataQuery));
    }
  }
}
