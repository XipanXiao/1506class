import 'dart:async';

import 'package:angular/angular.dart';
import 'package:staff/model/class_info.dart';
import 'package:staff/model/user.dart';

@Injectable()
class UserService {
  final user = User('test user', 'a@b.com', 1,
      ClassInfo('test class', '12345678'));

  Future<User> getUserByEmail(String email) async => user;
}
