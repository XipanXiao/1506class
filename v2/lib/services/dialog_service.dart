import 'package:angular/angular.dart';
import 'package:angular_components/model/observable/observable.dart';
import 'package:v2/model/class_info.dart';
import 'package:v2/model/dialog_data.dart';
import 'package:v2/model/zb_choose_root_dialog_data.dart';
import 'package:v2/model/zb_login_dialog_data.dart';

@Injectable()
class DialogService {

  final _invoke = ObservableReference<DialogData>(null);

  Stream<DialogData> get requests => _invoke.stream;

  Future _invokeDialog(DialogData data) async {
    _invoke.value = data;
    return data.completer.future;
  }

  Future<bool> showZbLoginDialog({bool edit = false}) async {
    var result = await _invokeDialog(ZBLoginDialogData(edit));
    return result == true;
  }

  Future<bool> showZBChooseRootDialog(ClassInfo info) async {
    var result = await _invokeDialog(ZBChooseRootDialogData(info));
    return result == true;
  }
}
