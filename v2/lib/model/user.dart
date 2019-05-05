import 'package:angular_components/model/date/date.dart';

import 'class_info.dart';

class User {
  String name;
  String email;

  String occupation;
  String skills;

  int education;
  final int id;

  final ClassInfo classInfo;
  StaffInfo staff;

  User(this.name, this.email, this.id, this.classInfo, this.staff);

  User.fromJson(Map<String, dynamic> map)
      : name = map['name'],
        id = int.parse(map['id']),
        education = map['education'],
        email = map['email'],
        occupation = map['occupation'],
        skills = map['skills'],
        classInfo = ClassInfo.fromJson(map['classInfo']);
}

class StaffInfo {
  int organization;
  int title;

  int freeTime;
  Date startTime;

  String position;

  StaffInfo.fromJson(dynamic map)
      : position = map['position'],
      title = int.tryParse(map['title'] ?? ''),
      freeTime = int.tryParse(map['free_time'] ?? ''),
      startTime = Date.fromTime(DateTime.tryParse(map['start_time'] ?? '')),
      organization = int.tryParse(map['organization'] ?? '');
}
