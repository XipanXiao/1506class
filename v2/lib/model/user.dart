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
  final int status;
  final int birth_year;

  final String sn;

  final ClassInfo classInfo;
  StaffInfo staff;

  User({this.classInfo, this.zb_id, this.status = 0, this.sn, this.birth_year})
      : super.fromJson({
          'userID': zb_id?.toString(),
        });

  User.fromJson(Map<String, dynamic> map)
      : name = map['name'],
        id = map['id'] == null ? null : int.parse(map['id']),
        zb_id = int.tryParse(map['zb_id']?.toString() ?? map['userID'] ?? ''),
        email = map['email'],
        nickName = map['nickname'],
        education = int.tryParse(map['education']?.toString() ?? ''),
        occupation = map['occupation'],
        skills = map['skills'],
        sn = map['sn'] ?? map['internal_id'],
        birth_year = int.tryParse(
            map['birth_year'] ?? map['birthyear']?.toString() ?? ''),
        status = int.parse(map['status'] ?? '0'),
        classInfo = ClassInfo.fromJson(map['classInfo'] ?? {}),
        super.fromJson({});

  @override
  int get userID => zb_id;

  bool get isActive => status == 0;

  @override
  bool get isEmpty => (sn == null || sn.isEmpty) && birth_year == null;

  @override
  bool get isNotEmpty => !isEmpty;

  @override
  bool operator ==(that) {
    if (that is! User) return false;
    return sn == that.sn && birth_year == that.birth_year;
  }

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
