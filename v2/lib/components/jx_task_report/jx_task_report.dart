import 'dart:html';

import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/components/abstract_task_report/abstract_task_report.dart';
import 'package:v2/components/abstract_task_report/schedule_records_loader.dart';
import 'package:v2/components/guanxiu_grid/guanxiu_grid.dart';
import 'package:v2/components/schedule_grid/schedule_grid.dart';
import 'package:v2/model/auditable.dart';
import 'package:v2/model/jx_report_grid.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/zb_jx_task_data.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/zb_service.dart';

@Component(
  selector: 'jx-task-report',
  directives: [
    coreDirectives,
    GuanxiuGridComponent,
    MaterialButtonComponent,
    MaterialCheckboxComponent,
    MaterialIconComponent,
    ScheduleGridComponent,
  ],
  templateUrl: 'jx_task_report.html',
  exports: [AuditState],
)
class JxTaskReportComponent extends AbstractTaskReportComponent<JxTaskData> {
  final ZBService _zbService;

  JxTaskReportComponent(this._zbService, TaskRecordService taskService,
      ScheduleRecordsLoader loader)
      : super(_zbService, taskService, loader);

  @override
  bool get loadLimitRecords => true;

  @override
  JxTaskData createTaskData(Map<String, dynamic> map) =>
      JxTaskData.fromJson(map);

  @override
  ReportGrid<JxTaskData> createTaskGrid(int classId, int pre_classID) =>
      JxTaskGrid(classId, pre_classID);

  @override
  Future<void> reload(int halfTerm) async {
    await super.reload(halfTerm);
    if (!ZBService.authenticated) return;

    await _loadAllTaskData();
    (grid as JxTaskGrid).setColumns(halfTerm);
    _audit();
  }

  void _audit() {
    users.forEach((user) => user.audit());
    selection.clear();
    users.where((user) => user.failed).forEach(selection.select);
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

  /// Reports task data from bicw to zhibei.info, for all
  /// selected users.
  void report({TaskDataPair<JxTaskData> user}) async {
    var users = user == null ? selection.selectedValues : [user];
    if (users.isEmpty) return;

    if (!await _zbService.ensureEditPermission()) return;

    for (var user in users) {
      if (!await _zbService.reportTask(grid.pre_classID, halfTerm,
          grid.gridTypes.workGrid, user.bicwData)) {
        window.alert('Failed to report for ${user.bicwData.name}');
      }
    }

    grid.clearCache(halfTerm);
    await loadTaskDataForTerm(grid, halfTerm);
  }
}
