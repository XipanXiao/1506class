import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/components/abstract_task_report/abstract_task_report.dart';
import 'package:v2/components/schedule_grid/schedule_grid.dart';
import 'package:v2/model/jx_report_grid.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/zb_jx_task_data.dart';
import 'package:v2/services/course_service.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/zb_service.dart';

@Component(
  selector: 'jx-task-report',
  directives: [
    coreDirectives,
    MaterialButtonComponent,
    MaterialCheckboxComponent,
    MaterialIconComponent,
    ScheduleGridComponent,
  ],
  templateUrl: 'jx_task_report.html',
  exports: [AuditState],
)
class JxTaskReportComponent extends AbstractTaskReportComponent<JxTaskData> {
  JxTaskReportComponent(CourseService courseService, ZBService zbService,
      TaskRecordService taskService)
      : super(courseService, zbService, taskService);

  @override
  JxTaskData createTaskData(Map<String, dynamic> map) =>
      JxTaskData.fromJson(map);

  @override
  ReportGrid<JxTaskData> createTaskGrid(int classId, int pre_classID) =>
      JxTaskGrid(classId, pre_classID);

  @override
  Future<void> reload(int halfTerm) async {
    await super.reload(halfTerm);
    await _loadAllTaskData();
    (grid as JxTaskGrid).setColumns(halfTerm);
  }

  /// Fetches zhibei task data for all terms.
  ///
  /// This is needed to determine in which half term a task becomes reportable.
  void _loadAllTaskData() async {
    var terms = ReportGrid.halfTerms;
    if (terms.every(grid.isLoaded)) return;

    for (var halfTerm in terms) {
      await loadTaskDataForTerm(grid, halfTerm);
    }
    for (var halfTerm in terms) {
      grid.moveBicwData(halfTerm);
    }
    grid.computeTotals();
  }
}
