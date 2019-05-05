import 'dart:async';

import 'package:angular/angular.dart';
import 'package:staff/model/user.dart';

import 'package:staff/utils.dart' as utils;

@Injectable()
class UserService {
  User user;

  UserService();

  Future<User> getUserByEmail(
      {String email = '', bool includeStaffInfo = true}) async {
    var url = 'php/services.php?rid=users&email=$email';
    var map = await utils.httpGetObject(url);
    if (map['error'] == 'login needed') {
      utils.login();
      return null;
    }
    var user = User.fromJson(map);
    if (includeStaffInfo) {
      var url = 'php/organization.php?rid=staff&user=${map["id"]}';
      var staffs = (await utils.httpGetObject(url));
      user.staff = StaffInfo.fromJson(staffs[0]);
    }
    return user;
  }

  Future<void> initUser() async {
    user = await getUserByEmail();
  }

  Future<List<User>> searchByName(String name) async {
    var url = 'php/services.php?rid=search_name&name=$name';
    List list = await utils.httpGetObject(url);
    return list.map((map) => User.fromJson(map)).toList();
  }

  Future<String> getUserLabel(int id) async {
    var url = 'php/services.php?rid=user_label&id=$id';
    var obj = await utils.httpGetObject(url);
    return obj['label'];
  }

  Future<dynamic> searchUser(dynamic query) =>
      (query is int) ? getUserLabel(query) : searchByName(query);
}
