import 'package:angular/angular.dart';
import 'package:v2/components/app_bar/app_bar.dart';

import 'package:v2/model/user.dart';
import 'package:v2/services/user_service.dart';

@Component(
  selector: 'app',
  directives: [
    AppBarComponent,
  ],
  template: '''<app-bar [user]="user"></app-bar>''',
)
class AppComponent {
  final UserService _userService;

  AppComponent(this._userService);

  User get user => _userService.user;
}
