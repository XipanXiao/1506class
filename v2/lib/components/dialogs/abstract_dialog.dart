import 'package:v2/model/dialog_data.dart';

class AbstractDialog {
  bool show;
  DialogData data;

  void open(DialogData data) {
    this.data = data;
    show = true;
  }

  void close(dynamic result) {
    show = false;
    data.completer.complete(result);
  }
}
