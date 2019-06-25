import 'package:angular/angular.dart';
import 'package:angular_components/material_icon/material_icon.dart';
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

  final grid = RxlTaskGrid()
    ..pre_classID = 7156
    ..half_term = 17;

  RxlTaskReportComponent(this._zbService) {
    _init();
  }

  void _init() async {
    grid.taskData.addAll(await _zbService.getRxlTaskData(grid.taskDataQuery));
  }
}
