import 'package:angular/angular.dart';
import 'package:v2/components/abstract_task_report/schedule_records_loader.dart';
import 'package:v2/model/class_info.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/zb_task_data.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/zb_service.dart';

import 'has_selectable.dart';

abstract class AbstractTaskReportComponent<T extends TaskData>
    extends HasSelectable<TaskDataPair<T>> {
  final ZBService _zbService;
  final TaskRecordService _taskService;
  final ScheduleRecordsLoader _scheduleLoader;

  @override
  final users = <TaskDataPair<T>>[];

  @Input()
  set classInfo(ClassInfo classInfo) {
    if (classInfo == null || classInfo == _classInfo) return;
    _classInfo = classInfo;
    _classInfo.taskGrid ??= createTaskGrid(classInfo.id, classInfo.zb_id);

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

  ReportGrid<T> grid;
  bool loadLimitRecords = false;

  int _halfTerm;
  ClassInfo _classInfo;

  AbstractTaskReportComponent(
      this._zbService, this._taskService, this._scheduleLoader);

  int get halfTerm => _halfTerm;

  /// Whether the [column] is displayed in the task grid.
  ///
  /// For example, 'baiziming' is only displayed for the last
  /// several terms.
  bool hasColumn(String column) => grid.columns.contains(column);

  /// Construts a type specific [RedportGrid] object.
  ReportGrid<T> createTaskGrid(int classId, int pre_classID);

  /// Construts a type specific [TaskData] object.
  T createTaskData(Map<String, dynamic> map);

  Future<void> reload(int halfTerm) async {
    var grid = _classInfo.taskGrid;

    if (grid.taskData.isEmpty) {
      var taskData =
          await _taskService.getTaskDataStats(_classInfo.id, createTaskData);
      grid.setTaskData(taskData);
    }

    if (ZBService.authenticated) {
      await loadTaskDataForTerm(grid, halfTerm);
      await _scheduleLoader.load(grid, halfTerm,
          loadLimitRecords: loadLimitRecords);
    }

    // Initialize the grid object and _halfTerm after everything is loaded.
    this.grid = grid;
    this._halfTerm = halfTerm;
    _initUsers();
  }

  void _initUsers() {
    users.clear();
    var halfTermData = grid.taskData[_halfTerm];
    if (halfTermData != null) {
      users.addAll(halfTermData.values);
    }
  }

  /// Reports task data from bicw to zhibei.info, for all
  /// selected users.
  void report({TaskDataPair<T> user});

  /// Fetches zhibei task data for [halfTerm].
  Future<void> loadTaskDataForTerm(ReportGrid<T> grid, int halfTerm) async {
    if (grid.isLoaded(halfTerm)) return;

    var zbData = await _zbService.getTaskData(
        _classInfo.zb_id, grid.gridTypes.workGrid, halfTerm, createTaskData);
    grid.setTaskData({halfTerm: zbData}, zhibei: true);
  }
}
