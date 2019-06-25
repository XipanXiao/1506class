import 'package:angular/angular.dart';
import 'package:angular_router/angular_router.dart';
import 'package:v2/components/rxl_task_report/rxl_task_report.dart';

@Component(
  selector: 'class-viewer',
  directives: [RxlTaskReportComponent,],
  templateUrl: 'class_viewer.html',
)
class ClassViewerComponent implements OnActivate {
  @override
  Future onActivate(_1, _2) async {
  }
}
