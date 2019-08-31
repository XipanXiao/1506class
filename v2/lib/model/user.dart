import 'package:angular_components/model/date/date.dart';
import 'package:v2/model/base_entity.dart';
import 'package:v2/model/zb_task_data.dart';

import 'class_info.dart';

class User extends TaskData {
  @override
  String name;

  String email;

  String nickName;
  String occupation;
  String skills;

  int education;
  int id;
  final int zb_id;

  final ClassInfo classInfo;
  StaffInfo staff;

  User({this.classInfo, this.zb_id}): super.fromJson({
    'userID': zb_id?.toString(),
  });

  User.fromJson(Map<String, dynamic> map)
      : name = map['name'],
        id = int.parse(map['id']),
        zb_id = int.tryParse(map['zb_id']?.toString() ?? ''),
        email = map['email'],
        nickName = map['nickname'],
        education = map['education'],
        occupation = map['occupation'],
        skills = map['skills'],
        classInfo = ClassInfo.fromJson(map['classInfo'] ?? {}),
        super.fromJson({});
  
  @override
  int get userID => zb_id;

  String get displayLabel => nickName?.isNotEmpty == true
      ? '$name($nickName) - $email'
      : '$name-$email';

  Map<String, String> toMap() {
    return <String, String>{
      'rid': 'user',
      'id': '$id',
      'name': name,
      'email': email,
      'nickname': nickName,
      'education': education?.toString(),
      'occupation': occupation,
      'skills': skills,
    };
  }
}

class StaffInfo implements BaseEntity {
  int id;
  int organization;
  int title;
  int manager;
  int user;

  int freeTime;
  Date startTime;

  StaffInfo.fromJson(dynamic map)
      : id = int.tryParse(map['id'] ?? ''),
        title = int.tryParse(map['title'] ?? ''),
        manager = int.tryParse(map['manager'] ?? ''),
        user = int.tryParse(map['user'] ?? ''),
        freeTime = int.tryParse(map['free_time'] ?? ''),
        startTime = Date.fromTime(DateTime.tryParse(map['start_time'] ?? '')),
        organization = int.tryParse(map['organization'] ?? '');

  Map<String, String> toMap() {
    return <String, String>{
      'rid': 'staff',
      'id': id?.toString(),
      'organization': organization?.toString(),
      'title': title?.toString(),
      'manager': manager?.toString(),
      'user': '$user',
      'free_time': freeTime?.toString(),
      'start_time': startTime?.toString(),
    };
  }
}
