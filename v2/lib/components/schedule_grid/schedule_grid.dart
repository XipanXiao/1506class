import 'dart:html';

import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/components/abstract_task_report/has_selectable.dart';
import 'package:v2/components/abstract_task_report/schedule_records_loader.dart';
import 'package:v2/model/auditable.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/schedule_task_data_pair.dart';
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
class ScheduleGridComponent extends HasSelectable<ScheduleTaskDataPair> {
  final ZBService _zbService;
  final ScheduleRecordsLoader _loader;

  @override
  final users = <ScheduleTaskDataPair>[];

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

  ScheduleGridComponent(this._zbService, this._loader);

  ReportGrid get grid => _grid;
  List<Lesson> get lessons => _grid?.getLessons(_halfTerm, limited: limited);

  void _reload() async {
    if (_grid == null || _halfTerm == null) return;
    if (limited) {
      await _loadAttendences(_halfTerm);
    }

    users.clear();
    for (var pair in _grid.scheduleRecords.values) {
      pair = (pair.clone() as ScheduleTaskDataPair)
        ..lessons = lessons
        ..limited = limited
        ..audit();
      users.add(pair);
      if (pair.failed) {
        selection.select(pair);
      }
    }
  }

  /// Reports task data from bicw to zhibei.info, for all
  /// selected users.
  void report({ScheduleTaskDataPair user}) async {
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
    // TODO (xxp): This '_reload' actually does nothing but auditing.
    _reload();
  }

  Future<void> _loadAttendences(int halfTerm) {
    var bicwUsers = _grid.scheduleRecords.values.map((user) => user.bicwData);
    return _loader.loadAttendences(grid, halfTerm, bicwUsers);
  }
}
