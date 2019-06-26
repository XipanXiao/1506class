import 'package:angular/angular.dart';
import 'package:angular_components/model/observable/observable.dart';
import 'package:v2/model/dialog_data.dart';

@Injectable()
class DialogService {
  static const zbLoginDialog = 'zb-login-dialog';

  final _invoke = ObservableReference<DialogData>(null);

  Stream<DialogData> get requests => _invoke.stream;

  Future _invokeDialog(DialogData data) async {
    _invoke.value = data;
    return data.completer.future;
  }

  Future<bool> showZbLoginDialog() async {
    var result = await _invokeDialog(DialogData(zbLoginDialog));
    return result == true;
  }
}
