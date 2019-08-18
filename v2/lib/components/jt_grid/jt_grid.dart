import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/components/abstract_task_report/has_selectable.dart';
import 'package:v2/components/abstract_task_report/schedule_records_loader.dart';
import 'package:v2/components/schedule_grid/schedule_grid.dart';
import 'package:v2/model/auditable.dart';
import 'package:v2/model/class_info.dart';
import 'package:v2/model/jt_report_grid.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/zb_jt_task_data.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/zb_service.dart';

@Component(
  selector: 'jt-grid',
  directives: [
    coreDirectives,
    MaterialButtonComponent,
    MaterialCheckboxComponent,
    MaterialIconComponent,
    ScheduleGridComponent,
  ],
  templateUrl: 'jt_grid.html',
  exports: [AuditState],
)
class JtGridComponent extends HasSelectable<TaskDataPair<JtTaskData>> {
  final ZBService _zbService;
  final TaskRecordService _taskService;
  final ScheduleRecordsLoader _scheduleLoader;

  JtGridComponent(this._zbService, this._taskService, this._scheduleLoader);

  @override
  final users = <TaskDataPair<JtTaskData>>[];

  @Input()
  set classInfo(ClassInfo classInfo) {
    if (classInfo == null || classInfo == _classInfo) return;
    _classInfo = classInfo;
    _classInfo.taskGrid ??= JtTaskGrid(classInfo.id, classInfo.zb_id);

    if (_halfTerm != null) {
      reload(_halfTerm);
    }
  }

  @Input()
  set halfTerm(int halfTerm) {
    if (halfTerm == null || halfTerm == _halfTerm) return;
    if (_classInfo != null) {
      reload(halfTerm);
    }
  }

  JtTaskGrid grid;
  ClassInfo _classInfo;
  int _halfTerm;

  int get halfTerm => _halfTerm;

  JtTaskData createTaskData(Map<String, dynamic> map) =>
      JtTaskData.fromJson(map);

  Future<void> reload(int halfTerm) async {
    var grid = _classInfo.taskGrid;

    if (grid.taskData.isEmpty) {
      var taskData =
          await _taskService.getTaskDataStats(_classInfo.id, createTaskData);
      grid.setTaskData(taskData);
      grid.computeTotals();
    }

    if (await _zbService.ensureAuthenticated()) {
      var data = await _zbService.getJtTaskData(grid.pre_classID, halfTerm);
      grid.setTaskData({halfTerm: data}, zhibei: true);
      await _scheduleLoader.load(grid, halfTerm);
    }

    // Initialize the grid object and _halfTerm after everything is loaded.
    this.grid = grid;
    this._halfTerm = halfTerm;
    _initSelection();
  }

  void _initSelection() {
    users.clear();
    var halfTermData = grid.taskData[_halfTerm];
    if (halfTermData != null) {
      users.addAll(halfTermData.values);
      selection.clear();
      users.where((user) => user.failed).forEach(selection.select);
    }
  }

  void report({user}) {}
}
