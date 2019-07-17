import 'dart:async';

import 'package:angular/angular.dart';
import 'package:v2/model/user.dart';

import 'package:v2/utils.dart' as utils;

@Injectable()
class UserService {
  static const _serviceUrl = 'php/services.php';

  /// The current logged on user.
  User user;

  UserService();

  Future<User> getUserByEmail(
      {String email = '', bool includeStaffInfo = true}) async {
    var url = '$_serviceUrl?rid=users&email=$email';
    var map = await utils.httpGetObject(url);
    if (map['error'] == 'login needed') {
      utils.login();
      return null;
    }
    var user = User.fromJson(map);
    if (includeStaffInfo) {
      var url = 'php/organization.php?rid=staff&user=${user.id}';
      var staffs = (await utils.httpGetObject(url));
      if (staffs == null || staffs.isEmpty) return user;
      user.staff = StaffInfo.fromJson(staffs[0]);
    }
    return user;
  }

  /// Initialize the current logged on [user].
  Future<void> initUser({bool includeStaffInfo = true}) async {
    user = await getUserByEmail(includeStaffInfo: includeStaffInfo);
  }

  Future<List<User>> searchByName(String name) async {
    var url = '$_serviceUrl?rid=search_name&name=$name';
    List list = await utils.httpGetObject(url);
    return list.map((map) => User.fromJson(map)).toList();
  }

  Future<String> getUserLabel(int id) async {
    var url = '$_serviceUrl?rid=user_label&id=$id';
    var obj = await utils.httpGetObject(url);
    return obj['label'];
  }

  Future<void> updateUser(User user) async {
    await utils.httpPostObject('$_serviceUrl?rid=user', user);
    if (user.staff != null) {
      await utils.httpPostObject('php/organization.php?rid=staff', user.staff);
    }
  }
}
