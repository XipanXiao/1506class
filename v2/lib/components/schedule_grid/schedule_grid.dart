import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/schedule_record.dart';
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
class ScheduleGridComponent {
  final ZBService _zbService;
  final users = <TaskDataPair>[];

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
  List<Lesson> get lessons => _grid?.getLessons(_halfTerm);

  void _reload() async {
    if (_grid == null || _halfTerm == null) return;

    if (!_grid.isScheduleLoaded(_halfTerm)) {
      var scheduleRecords =
          await _zbService.getScheduleRecords(_grid.pre_classID, _halfTerm);
      _grid.setZBScheduleRecords(_halfTerm, scheduleRecords);
    }

    users
      ..clear()
      ..addAll(_grid.taskData[_halfTerm].values.map((pair) =>
          TaskDataPair.from(pair)
            ..auditScheduleRecords(_grid.getLessons(_halfTerm))));
  }

  ScheduleRecord getUserScheduleRecord(TaskDataPair user, int lesson_id,
      {bool zhibei = false}) {
    var records = zhibei
        ? user.zhibeiData?.scheduleRecords
        : user.bicwData?.scheduleRecords;
    return records == null ? null : records[lesson_id];
  }
}
