import 'dart:html';

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
    if (ZBService.authenticated) {
      await _loadAttendences(halfTerm);
      _audit();
    }
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
    var data = zhibei ? user.zhibeiData : user.bicwData;
    if (data == null) return null;
    return data == null ? null : data.scheduleRecords[lesson_id];
  }

  /// Reports task data from bicw to zhibei.info, for all
  /// selected users.
  @override
  void report({TaskDataPair<T> user}) async {
    var users = user == null ? selection.selectedValues : [user];
    if (users.isEmpty) return;

    if (!await _zbService.ensureEditPermission()) return;

    for (var user in users) {
      if (!await _zbService.reportScheduleTask(
          grid.gridTypes.workGrid, grid.pre_classID, halfTerm, user)) {
        window.alert('Failed to report for ${user.bicwData.name}');
      }
    }

    grid.clearCache(halfTerm);
    await reload(halfTerm);
  }

  void _copyScheduleData(T user) {
    var records = grid.scheduleRecords[user.id];
    if (records == null) return;

    for (var lesson in lessons) {
      var record = records.bicwData.scheduleRecords[lesson.lesson_id];
      user.scheduleRecords[lesson.lesson_id] = record;
    }
  }

  void _audit() {
    if (lessons == null) return;

    for (var user in users) {
      if (user.bicwData == null) continue;
      _copyScheduleData(user.bicwData);
      user.bicwData.lessons = lessons;
      user.zhibeiData?.lessons = lessons;
      user.audit(compareAtt: true);
    }
    selection.clear();
    users.where((user) => user.failed).forEach(selection.select);
  }
}
