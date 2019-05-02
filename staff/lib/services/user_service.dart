import 'dart:async';
import 'dart:convert';
import 'dart:html';

import 'package:angular/angular.dart';
import 'package:staff/model/user.dart';

import 'package:staff/utils.dart' as utils;

@Injectable()
class UserService {
  User user;

  UserService();

  Future<User> getUserByEmail([String email = '']) async {
    var url = 'php/services.php?rid=users&email=$email';
    var response =
        await HttpRequest.getString(utils.checkUrl(url), withCredentials: true);
    var map = jsonDecode(response);
    if (map['error'] == 'login needed') {
      login();
      return null;
    }
    return User.fromJson(map);
  }

  void login() {
    var index = window.location.pathname.lastIndexOf("/") + 1;
    var filename = window.location.pathname.substring(index);
    var url = 'login.html?redirect=$filename${window.location.search}&tag=2019';
    window.open(Uri.encodeFull(utils.checkUrl(url)), '_self');
  }

  Future<void> initUser() async {
    user = await getUserByEmail();
  }
}
