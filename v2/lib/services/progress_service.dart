import 'package:angular/angular.dart';
import 'package:angular_components/model/observable/observable.dart';

@Injectable()
class ProgressService {
  final _request = ObservableReference<Progress>(null);

  Stream<Progress> get requests => _request.stream;

  void showProgress(String message, {int progress}) {
    _request.value = Progress(message,
        activeProgress: progress, indeterminate: progress == null);
  }

  void done() {
    _request.value = null;
  }
}

class Progress {
  final String statusText;

  final int activeProgress;
  final bool indeterminate;
  final int max;
  final int min;

  Progress(this.statusText,
      {this.activeProgress = 0,
      this.indeterminate = false,
      this.max = 100,
      this.min = 0});
}
