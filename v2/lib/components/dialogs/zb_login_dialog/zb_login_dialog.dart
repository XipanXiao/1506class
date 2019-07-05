import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/laminate/components/modal/modal.dart';
import 'package:angular_components/laminate/overlay/module.dart';
import 'package:angular_components/material_button/material_button.dart';
import 'package:angular_components/material_dialog/material_dialog.dart';
import 'package:angular_forms/angular_forms.dart';
import 'package:v2/services/zb_service.dart';
import 'package:v2/utils.dart' as utils;

import 'package:v2/components/dialogs/abstract_dialog.dart';

@Component(
  selector: 'zb-login-dialog',
  providers: [overlayBindings],
  directives: [
    MaterialButtonComponent,
    MaterialDialogComponent,
    ModalComponent,
    formDirectives,
    materialInputDirectives,
  ],
  templateUrl: 'zb_login_dialog.html',
  styleUrls: ['zb_login_dialog.css'],
)
class ZBLoginDialogComponent extends AbstractDialog {
  final phpUrlBase = utils.getPHPUrl('php/proxy.php');

  final ZBService _zbService;

  String username;
  String password;
  String editPassword;
  String captcha;

  ZBLoginDialogComponent(this._zbService);

  void login() async {
    close(await _zbService.login(username, password, editPassword, captcha));
  }
}
