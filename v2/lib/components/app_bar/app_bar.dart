import 'dart:html';

import 'package:angular/angular.dart';
import 'package:angular_components/material_input/material_input.dart';
import 'package:v2/model/user.dart';

@Component(
  selector: 'app-bar',
  directives: [MaterialInputComponent, NgIf],
  templateUrl: 'app_bar.html',
  styleUrls: ["app_bar.css"],
)
class AppBarComponent {
  @Input()
  User user;

  bool isIn(String page) => window.location.pathname.endsWith(page);
  bool isAdmin() => false;
  bool isSysAdmin() => false;
  bool isDistrictInspector() => false;
  bool isYearLeader() => false;

  bool isOrderAdmin() => false;
  bool isTeacher() => false;
  bool canReadOrders() => false;
  bool showAssignments() => false;

  bool get admining => false;
}
