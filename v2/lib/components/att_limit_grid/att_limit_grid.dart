import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/components/abstract_task_report/has_selectable.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/zb_task_data.dart';
import 'package:v2/services/zb_service.dart';

@Component(
  selector: 'att-limit-grid',
  directives: [
    coreDirectives,
    MaterialButtonComponent,
    MaterialCheckboxComponent,
    MaterialIconComponent,
  ],
  templateUrl: 'att_limit_grid.html',
  exports: [AuditState],
)
class AttLimitGridComponent extends HasSelectable<TaskData> {
  final ZBService _zbService;

  @override
  final users = <TaskDataPair<TaskData>>[];

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

  AttLimitGridComponent(this._zbService);

  ReportGrid get grid => _grid;

  void _reload() async {
    if (_grid == null || _halfTerm == null) return;

    if (!grid.isLimitScheduleLoaded(_halfTerm)) {
      var data = await _zbService.getAttLimitRecords(
          _grid.pre_classID, _halfTerm, grid.gridTypes.attLimitGrid);
      grid.setZBLitmitScheduleData(_halfTerm, data);
    }

    users
      ..clear()
      ..addAll(_grid.taskData[_halfTerm].values
          .map((pair) => TaskDataPair.from(pair)..auditAttLimit()));
    users.where((user) => user.failed).forEach(selection.select);
  }

  /// Reports task data from bicw to zhibei.info, for all
  /// selected users.
  void report({TaskDataPair<TaskData> user}) async {
    var users = user == null ? selection.selectedValues : [user];
    if (users.isEmpty) return;

    if (!await _zbService.ensureAuthenticated()) return;

    for (var user in users) {}
    _reload();
  }
}
