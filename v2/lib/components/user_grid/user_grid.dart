import 'dart:html';

import 'package:angular/angular.dart';
import 'package:angular_components/material_button/material_button.dart';
import 'package:angular_components/material_checkbox/material_checkbox.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:v2/components/abstract_task_report/has_selectable.dart';
import 'package:v2/model/auditable.dart';
import 'package:v2/model/class_info.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/user.dart';
import 'package:v2/services/dialog_service.dart';
import 'package:v2/services/user_service.dart';
import 'package:v2/services/zb_service.dart';

@Component(
  selector: 'user-grid',
  directives: [
    coreDirectives,
    MaterialButtonComponent,
    MaterialCheckboxComponent,
    MaterialIconComponent,
  ],
  templateUrl: 'user_grid.html',
  exports: [AuditState],
)
class UserGridComponent extends HasSelectable<TaskDataPair<User>> {
  final DialogService _dialogService;
  final UserService _userService;
  final ZBService _zbService;

  @override
  List<TaskDataPair<User>> get users => _classInfo?.users ?? [];

  @Input()
  set classInfo(ClassInfo classInfo) {
    if (classInfo == null || classInfo == _classInfo) return;
    _classInfo = classInfo;
    _reload();
  }

  ClassInfo _classInfo;

  UserGridComponent(this._zbService, this._userService, this._dialogService);

  Future<void> _reload() async {
    if (_classInfo.users.isEmpty) {
      var users = await _userService.getUsers(_classInfo.id);
      for (var user in users) {
        _classInfo.users.add(TaskDataPair<User>()..bicwData = user);
      }
    }

    if (_classInfo.zb_id != null &&
        _classInfo.zb_id > 0 &&
        await _zbService.ensureAuthenticated()) {
      var zbUsers = await _zbService.getUsers(_classInfo.zb_id);
      // Build a map from zb_id to bicw User.
      var userMap = Map<int, TaskDataPair<User>>.fromIterable(_classInfo.users,
          key: (user) => user.bicwData.userID);

      for (var zbUser in zbUsers) {
        if (!zbUser.isActive) continue;

        var pair = userMap[zbUser.userID];
        if (pair == null) {
          // A user only exists from zhibei.info.
          _classInfo.users.add(TaskDataPair<User>()..zhibeiData = zbUser);
        } else {
          pair.zhibeiData = zbUser;
        }
      }
    }

    _audit();
  }

  void _audit() {
    for (var pair in users) {
      pair.audit();
      if (pair.reportable) {
        selection.select(pair);
      }
    }
  }

  String getGenderLabel(User user) => {0: '男', 1: '女'}[user?.gender];

  /// Reports task data from bicw to zhibei.info, for all
  /// selected users.
  void report({TaskDataPair<User> user}) async {
    var users = user == null ? selection.selectedValues : [user];
    if (users.isEmpty) return;

    if (_classInfo.zb_id == null || _classInfo.zb_id == 0) {
      if (!await _dialogService.showZBChooseRootDialog(_classInfo)) {
        return;
      }
    } else if (!await _zbService.ensureEditPermission()) {
      return;
    }

    for (var user in users) {
      if (user.bicwData.zb_id == null &&
          !await _zbService.createUser(_classInfo.zb_id, user.bicwData)) {
        window.alert('Failed to create user for ${user.bicwData.name}');
      } else if (user.bicwData.zb_id != null &&
          !await _zbService.updateUser(user.bicwData)) {
        window.alert('Failed to report for ${user.bicwData.name}');
      }
    }

    await _reload();
  }
}
