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
      await _classInfo.setZBUsers(
          zbUsers, _userService.updateUser, _zbService.findUser);
    }

    _audit();
  }

  void _audit() {
    for (var pair in users) {
      pair.audit();
      if (pair.reportable) {
        selection.select(pair);
        _setReportAction(pair);
      }
    }
  }

  void _setReportAction(TaskDataPair<User> pair) {
    if (pair.bicwData != null && pair.zhibeiData != null) {
      if (!pair.zhibeiData.isActive) {
        pair.action = '激活';
      } else if (pair.bicwData.pre_classID != pair.zhibeiData.pre_classID) {
        pair.action = '转班';
      } else {
        pair.action = '更新';
      }
    } else if (pair.bicwData != null && pair.zhibeiData == null) {
      pair.action = '新建';
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
      if (user.zhibeiData != null && !user.zhibeiData.isActive) {
        // If the user is deleted in zhibei.info, recover the user.
        await _recover(user.zhibeiData);
      } else if (user.bicwData != null &&
          user.zhibeiData != null &&
          user.bicwData.pre_classID != user.zhibeiData.pre_classID) {
        // A user is in zhibei.info but not in this pre class,
        // transfer to this class.
        await _transfer(user.zhibeiData);
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

  /// Revives quit [user] from zhibei.info.
  Future<void> _recover(User user) async {
    if (window.confirm('用户${user.name}在zhibei.info已经退出。'
        '选择确认将恢复学员身份。或者选择取消，仔细核对之后再手工恢复。')) {
      await _zbService.recoverUser(_classInfo.zb_id, user.userID, user.name);
    }
  }

  /// Transfers [user] from her current class to the
  /// zhibei class identified by [_classInfo].zb_id.
  Future<void> _transfer(User user) async {
    if (window.confirm('用户${user.name}在zhibei.info另一个班级中。'
        '选择确认将转入本班。或者选择取消，仔细核对之后再手工转班。')) {
      await _zbService.transferUser(
          user.userID, user.pre_classID, _classInfo.zb_id, 'bicw auto sync');
    }
  }
}
