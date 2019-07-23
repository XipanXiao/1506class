import 'dart:html';

import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/components/abstract_task_report/has_selectable.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/zb_task_data.dart';
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
class ScheduleGridComponent extends HasSelectable<TaskData> {
  final ZBService _zbService;

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

  ScheduleGridComponent(this._zbService);

  ReportGrid get grid => _grid;
  List<Lesson> get lessons => _grid?.getLessons(_halfTerm, limited: limited);

  void _reload() async {
    if (_grid == null || _halfTerm == null) return;

    if (!_grid.isScheduleLoaded(_halfTerm)) {
      var gridType = limited
          ? grid.gridTypes.attLimitGrid
          : grid.gridTypes.main_course_grid;
      var scheduleRecords = await _zbService
          .getScheduleRecords(_grid.pre_classID, _halfTerm, grid: gridType);
      _grid.setZBScheduleRecords(_halfTerm, scheduleRecords, limit: limited);
    }

    users
      ..clear()
      ..addAll(_grid.taskData[_halfTerm].values.map((pair) =>
          TaskDataPair.from(pair)
            ..auditScheduleRecords(lessons, limited: limited)));
    users.where((user) => user.failed).forEach(selection.select);
  }

  ScheduleRecord getUserScheduleRecord(TaskData user, int lesson_id) {
    var records = user?.scheduleRecords;
    return records == null ? null : records[lesson_id];
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
}
