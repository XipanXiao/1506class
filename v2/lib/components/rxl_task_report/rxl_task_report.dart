import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:angular_components/utils/disposer/disposer.dart';
import 'package:angular_router/angular_router.dart';
import 'package:v2/model/class_info.dart';
import 'package:v2/model/report_grid.dart';
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
class RxlTaskReportComponent implements OnDestroy {
  final ZBService _zbService;
  final Router _router;
  final TaskRecordService _taskService;

  final _disposer = Disposer.oneShot();

  final users = <RxlTaskDataPair>[];
  final selection = SelectionModel<TaskDataPair>.multi();

  @Input()
  set classInfo(ClassInfo classInfo) {
    if (classInfo == null || classInfo == _classInfo) return;
    _classInfo = classInfo;
    _classInfo.taskGrid ??= RxlTaskGrid()..pre_classID = _classInfo.zb_id;

    _reload();
  }

  RxlTaskGrid get grid => _classInfo?.taskGrid;

  int halfTerm;

  ClassInfo _classInfo;
  RxlTaskReportComponent(this._zbService, this._router, this._taskService) {
    _disposer.addStreamSubscription(_router.onRouteActivated.listen(_reload));
  }

  void _reload([_]) async {
    halfTerm = int.parse(_router.current.parameters['half_term']);
    if (grid.taskData.isEmpty) {
      var taskData = await _taskService.getTaskDataStats(
          _classInfo.id, (json) => RxlTaskData.fromJson(json));
      grid.setTaskData(taskData);
    }
    if (!grid.isLoaded(halfTerm)) {
      if (await _zbService.ensureAuthenticated()) {
        var zbData =
            await _zbService.getRxlTaskData(grid.taskDataQuery(halfTerm));
        grid.setTaskData({halfTerm: zbData}, zhibei: true);
      }
    }

    users.clear();
    var halfTermData = grid.taskData[halfTerm];
    if (halfTermData != null) {
      users.addAll(halfTermData.values.map((user) => RxlTaskDataPair(user)));
      selection.clear();
      users.where((user) => user.audited == false).forEach(selection.select);
    }
  }

  @override
  void ngOnDestroy() {
    _disposer.dispose();
  }

  /// Reports task data from bicw to zhibei.info, for all
  /// selected users.
  void report({TaskDataPair user}) {}

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
