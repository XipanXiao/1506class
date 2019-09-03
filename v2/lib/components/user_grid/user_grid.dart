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
      // Build a map from zb_id to User pair.
      var idMap = Map<int, TaskDataPair<User>>.fromIterable(_classInfo.users,
          key: (user) => user.bicwData.userID);
      // Another map from name to User pair.
      var nameMap = Map<String, TaskDataPair<User>>.fromIterable(
          _classInfo.users,
          key: (user) => user.name);

      for (var zbUser in zbUsers) {
        if (!zbUser.isActive) continue;

        var pair = idMap[zbUser.userID] ?? nameMap[zbUser.name];
        if (pair == null) {
          // A user only exists from zhibei.info.
          _classInfo.users.add(TaskDataPair<User>()..zhibeiData = zbUser);
        } else {
          if (pair.bicwData.userID == null) {
            // A user exists in both systems but not linked.
            pair.bicwData.userID = zbUser.userID;
            await _userService.updateUser(pair.bicwData);
          }
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
      if (user.bicwData.userID != null && user.zhibeiData == null) {
        // A user is in zhibei.info but not in this pre class,
        // transfer to this class.
        var userClassInfo =
            await _zbService.getUserClassInfo(user.bicwData.userID);
        if (userClassInfo.status == 11) {
          // If the user is deleted in zhibei.info, recover the user.
          if (!window.confirm('用户${user.name}在zhibei.info已经删除。'
              '请确认恢复。或者选择取消，仔细核对之后再手工恢复。')) {
            continue;
          }
          await _zbService.recoverUser(
              userClassInfo.pre_classID, user.bicwData.userID, user.name);
        }
        await _zbService.transferUser(user.bicwData.userID,
            userClassInfo.pre_classID, _classInfo.zb_id, 'bicw auto sync');
      } else if (user.bicwData.zb_id == null &&
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
