import 'package:angular/angular.dart';
import 'package:v2/staff_app.template.dart' as ng;
import 'package:v2/services/user_service.dart';

import 'staff.template.dart' as self;

final _userService = UserService();
UserService getUserService() => _userService;

Future<void> main() async {
  await _userService.initUser();
  runApp(ng.AppComponentNgFactory, createInjector: staticInjector);
}

@GenerateInjector([
  FactoryProvider(UserService, getUserService),])
final staticInjector = self.staticInjector$Injector;
