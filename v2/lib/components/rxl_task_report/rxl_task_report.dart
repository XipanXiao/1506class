import 'dart:html';

import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/model/class_info.dart';
import 'package:v2/model/rxl_report_grid.dart';
import 'package:v2/model/zb_rxl_task_data.dart';
import 'package:v2/model/zb_task_data.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/zb_service.dart';

@Component(
  selector: 'rxl-task-report',
  directives: [
    coreDirectives,
    MaterialButtonComponent,
    MaterialCheckboxComponent,
    MaterialIconComponent,
  ],
  templateUrl: 'rxl_task_report.html',
  styleUrls: ['rxl_task_report.css'],
)
class RxlTaskReportComponent {
  final ZBService _zbService;
  final TaskRecordService _taskService;

  final users = <RxlTaskDataPair>[];
  final selection = SelectionModel<TaskDataPair>.multi();

  @Input()
  set classInfo(ClassInfo classInfo) {
    if (classInfo == null || classInfo == _classInfo) return;
    _classInfo = classInfo;
    _classInfo.taskGrid ??= RxlTaskGrid()..pre_classID = _classInfo.zb_id;

    _reload();
  }

  @Input()
  set halfTerm(int halfTerm) {
    if (halfTerm == null || halfTerm == _halfTerm) return;
    _halfTerm = halfTerm;
    _reload();
  }

  RxlTaskGrid get grid => _classInfo?.taskGrid;

  int _halfTerm;
  ClassInfo _classInfo;

  RxlTaskReportComponent(this._zbService, this._taskService);

  void _reload() async {
    if (_classInfo == null || _halfTerm == null) return;

    if (grid.taskData.isEmpty) {
      var taskData = await _taskService.getTaskDataStats(
          _classInfo.id, (json) => RxlTaskData.fromJson(json));
      grid.setTaskData(taskData);
    }
    if (!grid.isLoaded(_halfTerm)) {
      if (await _zbService.ensureAuthenticated()) {
        var zbData =
            await _zbService.getRxlTaskData(grid.taskDataQuery(_halfTerm));
        grid.setTaskData({_halfTerm: zbData}, zhibei: true);
      }
    }

    _initSelection();
  }

  void _initSelection() {
    users.clear();
    var halfTermData = grid.taskData[_halfTerm];
    if (halfTermData != null) {
      users.addAll(halfTermData.values.map((user) => RxlTaskDataPair(user)));
      selection.clear();
      users.where((user) => user.audited == false).forEach(selection.select);
    }
  }

  /// Reports task data from bicw to zhibei.info, for all
  /// selected users.
  void report({TaskDataPair user}) async {
    var users = user == null ? selection.selectedValues : [user];
    if (users.isEmpty) return;

    if (!await _zbService.ensureAuthenticated()) return;

    for (var user in users) {
      if (!await _zbService.reportTask(
          grid.pre_classID, _halfTerm, grid.grid_type, user.bicwData)) {
        window.alert('Failed to report for ${user.bicwData.name}');
        return;
      }
    }

    grid.clearCache(_halfTerm);
    _reload();
  }

  bool get allSelected => selection.selectedValues.length == users.length;

  void toggleSelectAll(String label) {
    if (label == true.toString()) {
      users.forEach(selection.select);
    } else if (label == false.toString()) {
      selection.clear();
    }
  }

  void toggleSelection(TaskDataPair user, bool checked) {
    if (checked) {
      selection.select(user);
    } else {
      selection.deselect(user);
    }
  }
}
