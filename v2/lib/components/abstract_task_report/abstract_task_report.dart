import 'dart:html';

import 'package:angular/angular.dart';
import 'package:v2/model/class_info.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/zb_task_data.dart';
import 'package:v2/services/course_service.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/zb_service.dart';

import 'has_selectable.dart';

abstract class AbstractTaskReportComponent<T extends TaskData>
    extends HasSelectable<T> {
  final CourseService _courseService;
  final ZBService _zbService;
  final TaskRecordService _taskService;

  @override
  final users = <TaskDataPair<T>>[];

  @Input()
  set classInfo(ClassInfo classInfo) {
    if (classInfo == null || classInfo == _classInfo) return;
    _classInfo = classInfo;
    _classInfo.taskGrid ??= createTaskGrid()..pre_classID = _classInfo.zb_id;

    if (_halfTerm != null) {
      _reload(_halfTerm);
    }
  }

  @Input()
  set halfTerm(int halfTerm) {
    if (halfTerm == null || halfTerm == _halfTerm) return;
    if (_classInfo != null) {
      _reload(halfTerm);
    }
  }

  ReportGrid<T> grid;

  int _halfTerm;
  ClassInfo _classInfo;

  AbstractTaskReportComponent(
      this._courseService, this._zbService, this._taskService);

  int get halfTerm => _halfTerm;

  /// Whether the [column] is displayed in the task grid.
  ///
  /// For example, 'baiziming' is only displayed for the last
  /// several terms.
  bool hasColumn(String column) => grid.columns.contains(column);

  /// Construts a type specific [RedportGrid] object.
  ReportGrid<T> createTaskGrid();

  /// Construts a type specific [TaskData] object.
  T createTaskData(Map<String, dynamic> map);

  void _reload(int halfTerm) async {
    var grid = _classInfo.taskGrid;

    if (grid.courses.isEmpty) {
      grid.courses.addAll(await _courseService.getCourses());
    }

    if (grid.taskData.isEmpty) {
      var taskData =
          await _taskService.getTaskDataStats(_classInfo.id, createTaskData);
      grid.setTaskData(taskData);
    }

    bool authenticated = false;
    var lessons = grid.getLessons(halfTerm);
    if (lessons == null) {
      authenticated = await _zbService.ensureAuthenticated();
      if (authenticated) {
        var lessons = await _zbService.getLessons(
            grid.pre_classID, grid.courseID, halfTerm);
        grid.setLessons(halfTerm, lessons);
      }
    }

    if (!grid.isLoaded(halfTerm) && authenticated) {
      var zbData = await _zbService.getTaskData(
          _classInfo.zb_id, grid.gridTypes.workGrid, halfTerm, createTaskData);
      grid.setTaskData({halfTerm: zbData}, zhibei: true);
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

  /// Reports task data from bicw to zhibei.info, for all
  /// selected users.
  void report({TaskDataPair<T> user}) async {
    var users = user == null ? selection.selectedValues : [user];
    if (users.isEmpty) return;

    if (!await _zbService.ensureAuthenticated()) return;

    for (var user in users) {
      if (!await _zbService.reportTask(grid.pre_classID, _halfTerm,
          grid.gridTypes.workGrid, user.bicwData)) {
        window.alert('Failed to report for ${user.bicwData.name}');
      }
    }

    grid.clearCache(_halfTerm);
    _reload(_halfTerm);
  }
}
