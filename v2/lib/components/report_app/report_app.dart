import 'package:angular/angular.dart';
import 'package:angular_router/angular_router.dart';
import 'package:v2/components/app_bar/app_bar.dart';
import 'package:v2/components/class_list/class_list.dart';
import 'package:v2/components/class_viewer/class_viewer.template.dart';

import 'package:v2/model/user.dart';
import 'package:v2/routing.dart';
import 'package:v2/services/user_service.dart';

@Component(
  selector: 'app',
  directives: [
    AppBarComponent,
    ClassListComponent,
    routerDirectives,
  ],
  templateUrl: 'report_app.html',
  styleUrls: ['report_app.css',],
)
class AppComponent {
  final UserService _userService;

  final routes = <RouteDefinition>[
    RouteDefinition(
        path: Routing.classRouting, component: ClassViewerComponentNgFactory),
  ];

  AppComponent(this._userService);

  User get user => _userService.user;
}
