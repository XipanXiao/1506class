import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/material_select/material_dropdown_select.dart';
import 'package:angular_router/angular_router.dart';
import 'package:v2/components/jt_grid/jt_grid.dart';
import 'package:v2/components/jx_task_report/jx_task_report.dart';
import 'package:v2/components/rxl_task_report/rxl_task_report.dart';
import 'package:v2/components/user_grid/user_grid.dart';
import 'package:v2/model/class_info.dart';
import 'package:v2/model/departments.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/routing.dart';
import 'package:v2/services/class_service.dart';
import 'package:v2/services/task_record_service.dart';

@Component(
  selector: 'class-viewer',
  directives: [
    JtGridComponent,
    JxTaskReportComponent,
    MaterialDropdownSelectComponent,
    NgIf,
    RxlTaskReportComponent,
    UserGridComponent,
  ],
  providers: [
    materialProviders,
  ],
  templateUrl: 'class_viewer.html',
  styleUrls: ['class_viewer.css'],
  exports: [Department],
)
class ClassViewerComponent implements OnActivate, CanReuse {
  static const _halfTermLabels = ['上', '下'];

  final ClassService _classService;
  final Router _router;
  final TaskRecordService _taskRecordService;

  ClassInfo classInfo;

  int _halfTerm;

  ClassViewerComponent(
      this._classService, this._router, this._taskRecordService);

  /// All possible half terms.
  List<int> get halfTerms => ReportGrid.halfTerms;

  String getHalfTermLabel(halfTerm) => halfTerm == 2
      ? '第1学期'
      : '第${(halfTerm / 2).floor()}学期${_halfTermLabels[halfTerm % 2]}';

  @override
  Future onActivate(RouterState previous, RouterState current) async {
    int classId = int.tryParse(current.parameters['id'] ?? '');

    var classInfo = await _classService.getClassById(classId);
    if (classInfo == null) return;

    _halfTerm = int.tryParse(current.parameters['half_term'] ?? '');
    if (_halfTerm == null) {
      _halfTerm = await _taskRecordService.getLastHalfTerm(classId);
      if (_halfTerm != 0) {
        _redirect(classId, _halfTerm);
      }
      return;
    }

    this.classInfo = classInfo;
  }

  @override
  Future<bool> canReuse(RouterState current, RouterState next) async => true;

  void _redirect(int classId, int half_term) {
    _router.navigate(Routing.getHalfTermRouting(classId, half_term));
  }

  int get halfTerm => _halfTerm;
  set halfTerm(int halfTerm) {
    if (classInfo == null) return;
    _redirect(classInfo.id, halfTerm);
  }
}
