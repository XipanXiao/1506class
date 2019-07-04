import 'package:angular/angular.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:angular_router/angular_router.dart';
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
  final Router _router;
  final TaskRecordService _taskService;

  final grid = RxlTaskGrid();

  @Input()
  set classInfo(ClassInfo classInfo) {
    if (classInfo == null || classInfo == _classInfo) return;
    _classInfo = classInfo;
    _reload();
  }

  int half_term = 0;

  ClassInfo _classInfo;
  RxlTaskReportComponent(this._zbService, this._router, this._taskService);

  void _reload() async {
    half_term = int.parse(_router.current.parameters['half_term']);
    grid.pre_classID = _classInfo.zb_id;
    if (grid.taskData.isEmpty) {
      var taskData = await _taskService.getTaskDataStats(
          _classInfo.id, (json) => RxlTaskData.fromJson(json));
      grid.setBicwTaskData(taskData);
    }
    if (!grid.isLoaded(half_term)) {
      if (await _zbService.ensureAuthenticated()) {
        var zbData =
            await _zbService.getRxlTaskData(grid.taskDataQuery(half_term));
        grid.setTaskData({half_term: zbData}, zhibei: true);
      }
    }
  }
}
