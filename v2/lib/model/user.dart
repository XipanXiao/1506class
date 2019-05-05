import 'package:angular_components/model/date/date.dart';

import 'class_info.dart';

class User {
  String name;
  String email;

  String nickName;
  String occupation;
  String skills;

  int education;
  int id;

  final ClassInfo classInfo;
  StaffInfo staff;

  User({this.classInfo});

  User.fromJson(Map<String, dynamic> map)
      : name = map['name'],
        id = int.parse(map['id']),
        email = map['email'],
        nickName = map['nickname'],
        education = map['education'],
        occupation = map['occupation'],
        skills = map['skills'],
        classInfo = ClassInfo.fromJson(map['classInfo'] ?? {});

  String get displayLabel =>
      nickName?.isNotEmpty == true ? '$name($nickName) - $email' : '$name-$email';

  void assign(User user) {
    id = user.id;
    name = user.name;
    email = user.email;
  }
}

class StaffInfo {
  int organization;
  int title;
  int manager;

  int freeTime;
  Date startTime;

  String position;

  StaffInfo.fromJson(dynamic map)
      : position = map['position'],
        title = int.tryParse(map['title'] ?? ''),
        manager = int.tryParse(map['manager'] ?? ''),
        freeTime = int.tryParse(map['free_time'] ?? ''),
        startTime = Date.fromTime(DateTime.tryParse(map['start_time'] ?? '')),
        organization = int.tryParse(map['organization'] ?? '');
}
