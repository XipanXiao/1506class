import 'package:angular/angular.dart';
import 'package:staff/components/app_bar/app_bar.dart';
import 'package:staff/components/staff_editor/staff_editor.dart';

import 'package:staff/model/user.dart';
import 'package:staff/services/user_service.dart';

@Component(
  selector: 'app',
  directives: [
    AppBarComponent,
    StaffEditorComponent,
  ],
  template: '''<app-bar [user]="user"></app-bar>
      <staff-editor [user]="user"></staff-editor>''',
)
class AppComponent {
  final UserService _userService;

  AppComponent(this._userService);

  User get user => _userService.user;
}
