import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/components/abstract_task_report/abstract_task_report.dart';
import 'package:v2/components/abstract_task_report/schedule_records_loader.dart';
import 'package:v2/components/schedule_grid/schedule_grid.dart';
import 'package:v2/model/auditable.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/rxl_report_grid.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/schedule_task_data_pair.dart';
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
class RxlTaskReportComponent extends AbstractTaskReportComponent<RxlTaskData> {
  final ZBService _zbService;
  final ScheduleRecordsLoader _loader;

  RxlTaskReportComponent(
      this._zbService, TaskRecordService taskService, this._loader)
      : super(_zbService, taskService, _loader);

  @override
  RxlTaskData createTaskData(Map<String, dynamic> map) =>
      RxlTaskData.fromJson(map);

  @override
  ReportGrid<RxlTaskData> createTaskGrid(int classId, int pre_classID) =>
      RxlTaskGrid(classId, pre_classID);

  List<Lesson> get lessons =>
      grid == null ? null : grid.limitedLessons[halfTerm];

  @override
  Future<void> reload(int halfTerm) async {
    await super.reload(halfTerm);
    grid.computeTotals();
    await _loadAttendences(halfTerm);
  }

  Future<void> _loadAttendences(int halfTerm) {
    var users = grid.taskData[halfTerm].values.map((pair) => pair.bicwData);
    return _loader.loadAttendences(grid, halfTerm, users);
  }

  @override
  Future<void> loadTaskDataForTerm(
      ReportGrid<RxlTaskData> grid, int halfTerm) async {
    if (grid.isLoaded(halfTerm)) return;

    var zbData = await _zbService.getRxlTaskData(grid.pre_classID, halfTerm);
    grid.setTaskData({halfTerm: zbData}, zhibei: true);
  }

  ScheduleRecord getRecord(int id, int lesson_id, {bool zhibei = false}) {
    if (grid == null) return null;
    var record = grid.scheduleRecords[id];
    if (record == null) return null;
    var schedules = zhibei ? record.zhibeiData : record.bicwData;
    if (schedules == null) return null;
    return schedules.scheduleRecords[lesson_id];
  }
}
