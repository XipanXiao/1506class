import 'package:angular/angular.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/model/class_info.dart';
import 'package:v2/model/departments.dart';
import 'package:v2/model/report_grid.dart';
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

  final grid = RxlTaskGrid();

  @Input()
  set classInfo(ClassInfo classInfo) {
    if (classInfo == null || classInfo == _classInfo) return;

    grid
      ..pre_classID = classInfo.zb_id
      ..half_term = classInfo.half_term
      ..taskData.clear();

    if (classInfo.department_id == Department.RUXINGLUN_DEPARTMENT) {
      _reload();
    }
  }

  ClassInfo _classInfo;

  RxlTaskReportComponent(this._zbService);

  void _reload() async {
    await _zbService.ensureAuthenticated();
    grid.taskData.addAll(await _zbService.getRxlTaskData(grid.taskDataQuery));
  }
}
