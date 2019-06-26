import 'package:angular/angular.dart';
import 'package:angular_router/angular_router.dart';
import 'package:v2/components/rxl_task_report/rxl_task_report.dart';
import 'package:v2/model/class_info.dart';
import 'package:v2/services/class_service.dart';
import 'package:v2/services/schedule_service.dart';

@Component(
  selector: 'class-viewer',
  directives: [RxlTaskReportComponent,],
  templateUrl: 'class_viewer.html',
)
class ClassViewerComponent implements OnActivate {
  final ClassService _classService;
  final ScheduleService _scheduleService;

  ClassInfo classInfo;
  ClassViewerComponent(this._classService, this._scheduleService);

  @override
  Future onActivate(RouterState previous, RouterState current) async {
    int classId = int.tryParse(current.parameters['id'] ?? '');
    int half_term = int.tryParse(current.parameters['half_term'] ?? '') ?? 0;
    var classes = await _classService.getClasses();
    var classInfo = classes[classId];

    if (classInfo == null) return;

    var groups = await _scheduleService.getScheduleGroups(classId, term: half_term % 2);
    if (groups.isEmpty) return;

    classInfo.half_term = half_term == 0 ? groups.last.term * 2 : half_term;
    this.classInfo = classInfo;
  }
}
