import 'package:v2/model/dialog_data.dart';

class ZBLoginDialogData extends DialogData {
  static const zbLoginDialog = 'zb-login-dialog';

  final bool edit;
  final bool login;
  ZBLoginDialogData({this.login = true, this.edit = false})
      : super(zbLoginDialog);
}
