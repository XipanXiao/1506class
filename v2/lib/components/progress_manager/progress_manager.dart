import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:v2/services/progress_service.dart';

@Component(
  selector: 'progress-manager',
  directives: [
    MaterialProgressComponent,
    NgIf,
  ],
  templateUrl: 'progress_manager.html',
  styleUrls: ['progress_manager.css',],
)
class ProgressManagerComponent {
  final ProgressService _progressService;

  Progress data;

  ProgressManagerComponent(this._progressService) {
    _listenProgressRequests();
  }

  Future _listenProgressRequests() async {
    await for (var data in _progressService.requests) {
      this.data = data;
    }
  }
}
