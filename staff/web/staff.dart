import 'package:angular/angular.dart';
import 'package:staff/app.template.dart' as ng;
import 'package:staff/services/user_service.dart';

import 'staff.template.dart' as self;

void main() {
  runApp(ng.AppComponentNgFactory, createInjector: staticInjector);
}

@GenerateInjector([
  UserService,
])
final staticInjector = self.staticInjector$Injector;
