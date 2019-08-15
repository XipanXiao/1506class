import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/components/abstract_task_report/has_selectable.dart';
import 'package:v2/model/auditable.dart';
import 'package:v2/model/guanxiu_data_pair.dart';
import 'package:v2/model/jx_report_grid.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/services/zb_service.dart';

@Component(
  selector: 'guanxiu-grid',
  directives: [
    coreDirectives,
    MaterialButtonComponent,
    MaterialCheckboxComponent,
    MaterialIconComponent,
  ],
  templateUrl: 'guanxiu_grid.html',
  styleUrls: ['guanxiu_grid.css'],
  exports: [AuditState],
)
class GuanxiuGridComponent extends HasSelectable<GuanxiuDataPair> {
  final ZBService _zbService;

  @override
  final users = <GuanxiuDataPair>[];

  @Input()
  set grid(JxTaskGrid grid) {
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
  JxTaskGrid _grid;

  GuanxiuGridComponent(this._zbService);

  JxTaskGrid get grid => _grid;
  List<Lesson> get lessons => _grid?.getGuanxiuLessons(_halfTerm);

  void _reload() async {
    if (_grid == null || _halfTerm == null) return;

    var records = _grid.guanxiuRecords[_halfTerm];
    if (records == null) {
      var lessons = await _zbService.getLessons(
          _grid.pre_classID, ReportGrid.guanxiuCoruseId, _halfTerm);
      _grid.guanxiuLessons[_halfTerm] = lessons;

      var guanxiuRecords = await _zbService.getGuanxiuRecords(
          _grid.pre_classID, _halfTerm, lessons);
      records = _grid.guanxiuRecords[_halfTerm] = <int, GuanxiuDataPair>{};
      for (var userID in guanxiuRecords.keys) {
        var pair = GuanxiuDataPair()..zhibeiData = guanxiuRecords[userID];
        records[userID] = pair;
      }
    }
    ;

    users.clear();
    for (var pair in records.values) {
      pair = (pair.clone() as GuanxiuDataPair)
        ..lessons = lessons
        ..audit();
      users.add(pair);
      if (pair.failed) {
        selection.select(pair);
      }
    }
  }

  /// Reports task data from bicw to zhibei.info, for all
  /// selected users.
  void report({GuanxiuDataPair user}) async {}
}
