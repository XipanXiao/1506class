import 'dart:html';

import 'package:angular/angular.dart';
import 'package:angular_router/angular_router.dart';
import 'package:v2/components/app_bar/app_bar.dart';
import 'package:v2/components/class_list/class_list.dart';
import 'package:v2/components/class_viewer/class_viewer.template.dart';
import 'package:v2/components/dialogs/dialog_manager.dart';
import 'package:v2/components/progress_manager/progress_manager.dart';

import 'package:v2/routing.dart';
import 'package:v2/services/user_service.dart';

@Component(
  selector: 'app',
  directives: [
    AppBarComponent,
    ClassListComponent,
    DialogManagerComponent,
    ProgressManagerComponent,
    routerDirectives,
  ],
  templateUrl: 'report_app.html',
  styleUrls: [
    'report_app.css',
  ],
)
class AppComponent {
  final routes = <RouteDefinition>[
    RouteDefinition(
        path: Routing.classRouting, component: ClassViewerComponentNgFactory),
    RouteDefinition(
        path: Routing.termRouting, component: ClassViewerComponentNgFactory),
  ];

  AppComponent(Router router, UserService userService) {
    var routing = window.location.hash;
    if (routing.isEmpty) {
      routing = Routing.getClassRouting(userService.user.classInfo.id);
    }
    router.navigate(routing);
  }
}
