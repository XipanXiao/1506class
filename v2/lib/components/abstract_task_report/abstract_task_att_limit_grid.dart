import 'package:v2/components/abstract_task_report/abstract_task_report.dart';
import 'package:v2/components/abstract_task_report/schedule_records_loader.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/schedule_task_data.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/zb_service.dart';

abstract class TaskAttLImitGridComponent<T extends ScheduleTaskData>
    extends AbstractTaskReportComponent<T> {
  final ZBService _zbService;
  final ScheduleRecordsLoader _loader;

  TaskAttLImitGridComponent(
      this._zbService, TaskRecordService taskService, this._loader)
      : super(_zbService, taskService, _loader);

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
  Future<void> loadTaskDataForTerm(ReportGrid<T> grid, int halfTerm) async {
    if (grid.isLoaded(halfTerm)) return;

    var zbData = await _zbService.getLimitTaskData(
        grid.gridTypes.workGrid, grid.pre_classID, halfTerm, createTaskData);
    grid.setTaskData({halfTerm: zbData}, zhibei: true);
  }

  ScheduleRecord getRecord(TaskDataPair<T> user, int lesson_id,
      {bool zhibei = false}) {
    if (grid == null) return null;
    if (zhibei) {
      return user.zhibeiData == null
          ? null
          : user.zhibeiData.scheduleRecords[lesson_id];
    } else {
      var records = grid.scheduleRecords[user.id];
      return records == null
          ? null
          : records.bicwData.scheduleRecords[lesson_id];
    }
  }
}
