import 'package:angular/angular.dart';
import 'package:angular_router/angular_router.dart';
import 'package:v2/components/report_app/report_app.template.dart' as ng;
import 'package:v2/services/class_service.dart';
import 'package:v2/services/course_service.dart';
import 'package:v2/services/dialog_service.dart';
import 'package:v2/services/progress_service.dart';
import 'package:v2/services/schedule_service.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/user_service.dart';
import 'package:v2/services/zb_service.dart';

import 'report.template.dart' as self;

final _userService = UserService();
UserService getUserService() => _userService;

Future<void> main() async {
  await _userService.initUser(includeStaffInfo: false);
  runApp(ng.AppComponentNgFactory, createInjector: staticInjector);
}

@GenerateInjector([
  routerProviders,
  ClassProvider(ClassService),
  ClassProvider(CourseService),
  ClassProvider(DialogService),
  ClassProvider(ProgressService),
  ClassProvider(TaskRecordService),
  ClassProvider(ScheduleService),
  ClassProvider(ZBService),
  FactoryProvider(UserService, getUserService),
])
final staticInjector = self.staticInjector$Injector;
