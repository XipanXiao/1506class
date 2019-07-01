import 'package:angular/angular.dart';
import 'package:angular_router/angular_router.dart';
import 'package:v2/components/rxl_task_report/rxl_task_report.dart';
import 'package:v2/model/class_info.dart';
import 'package:v2/model/departments.dart';
import 'package:v2/routing.dart';
import 'package:v2/services/class_service.dart';
import 'package:v2/services/task_record_service.dart';

@Component(
  selector: 'class-viewer',
  directives: [
    NgIf,
    RxlTaskReportComponent,
  ],
  templateUrl: 'class_viewer.html',
  styleUrls: ['class_viewer.css'],
  exports: [Department],
)
class ClassViewerComponent implements OnActivate, CanReuse {
  static const halfTermLabels = ['上', '下'];
  final ClassService _classService;
  final Router _router;
  final TaskRecordService _taskRecordService;

  ClassInfo classInfo;

  ClassViewerComponent(
      this._classService, this._router, this._taskRecordService);

  int get _term => ((classInfo?.half_term ?? 0) / 2).floor();
  int get _half => ((classInfo?.half_term ?? 0) % 2);
  String get halfTermLabel => '第${_term}学期${halfTermLabels[_half]}半学期';

  @override
  Future onActivate(RouterState previous, RouterState current) async {
    int classId = int.tryParse(current.parameters['id'] ?? '');

    var classInfo = await _classService.getClassById(classId);
    if (classInfo == null) return;

    int half_term = int.tryParse(current.parameters['half_term'] ?? '');
    if (half_term == null) {
      half_term = await _taskRecordService.getLastHalfTerm(classId);
      if (half_term != 0) {
        _redirect(classId, half_term);
      }
      return;
    }

    classInfo.half_term = half_term;
    this.classInfo = classInfo;
  }

  @override
  Future<bool> canReuse(RouterState current, RouterState next) async => true;

  void _redirect(int classId, int half_term) {
    _router.navigate(Routing.getHalfTermRouting(classId, half_term));
  }
}
