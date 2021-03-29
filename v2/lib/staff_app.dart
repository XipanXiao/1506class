import 'package:angular/angular.dart';
import 'package:v2/components/app_bar/app_bar.dart';
import 'package:v2/components/staff_editor/staff_editor.dart';

import 'package:v2/model/user.dart';
import 'package:v2/services/user_service.dart';

@Component(
  selector: 'app',
  directives: [
    AppBarComponent,
    StaffEditorComponent,
  ],
  template: '''<app-bar></app-bar>
      <staff-editor [user]="user"></staff-editor>''',
)
class AppComponent {
  final UserService _userService;

  AppComponent(this._userService);

  User get user => _userService.user;
}
