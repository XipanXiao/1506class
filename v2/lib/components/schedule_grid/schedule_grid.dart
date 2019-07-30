import 'dart:html';

import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/components/abstract_task_report/has_selectable.dart';
import 'package:v2/model/auditable.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/zb_task_data.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/zb_service.dart';

@Component(
  selector: 'schedule-grid',
  directives: [
    coreDirectives,
    MaterialButtonComponent,
    MaterialCheckboxComponent,
    MaterialIconComponent,
  ],
  templateUrl: 'schedule_grid.html',
  styleUrls: ['schedule_grid.css'],
  exports: [AuditState],
)
class ScheduleGridComponent extends HasSelectable<TaskDataPair<TaskData>> {
  final ZBService _zbService;
  final TaskRecordService _taskRecordService;

  @override
  final users = <TaskDataPair<TaskData>>[];

  @Input()
  bool limited = false;

  @Input()
  set grid(ReportGrid grid) {
    if (grid == null || grid == _grid) return;
    _grid = grid;
    _reload();
  }

  @Input()
  set halfTerm(int halfTerm) {
    if (halfTerm == null || halfTerm == _halfTerm) return;
    _halfTerm = halfTerm;
    _reload();
  }

  int _halfTerm;
  ReportGrid _grid;

  ScheduleGridComponent(this._zbService, this._taskRecordService);

  ReportGrid get grid => _grid;
  List<Lesson> get lessons => _grid?.getLessons(_halfTerm, limited: limited);

  void _reload() async {
    if (_grid == null || _halfTerm == null) return;

    users
      ..clear()
      ..addAll(_grid.scheduleRecords.values.map((pair) =>
          pair.clone()..auditScheduleRecords(lessons, limited: limited)));
    users.where((user) => user.failed).forEach(selection.select);

    await _loadAttendences(_halfTerm);
  }

  /// Reports task data from bicw to zhibei.info, for all
  /// selected users.
  void report({TaskDataPair<TaskData> user}) async {
    var users = user == null ? selection.selectedValues : [user];
    if (users.isEmpty) return;

    if (!await _zbService.ensureAuthenticated()) return;

    var gridType =
        limited ? grid.gridTypes.attLimitGrid : grid.gridTypes.report_main_grid;
    for (var user in users) {
      if (!await _zbService.reportScheduleTask(
          gridType,
          grid.pre_classID,
          _halfTerm,
          user.bicwData,
          grid.getLessons(_halfTerm, limited: limited),
          limited: limited)) {
        window.alert('Failed to report for ${user.name}');
      }
    }

    grid.clearScheduleCache(_halfTerm);
    _reload();
  }

  Future<void> _loadAttendences(int halfTerm) async {
    if (grid.schedules.isEmpty) {
      var schedules = await _taskRecordService.getSchedules(grid.classId);
      grid.schedules.addAll(schedules);
    }
    var bicwScheduleRecords =
        grid.scheduleRecords.map((id, pair) => MapEntry(id, pair.bicwData));
    var attendances = _taskRecordService.statAttendance(
        grid.schedules, bicwScheduleRecords, grid.getLessons(halfTerm));

    for (var user in users) {
      user.bicwData.att = attendances[user.bicwData.id]?.att;
    }
  }
}
