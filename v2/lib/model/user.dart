import 'dart:math';

import 'package:angular_components/model/date/date.dart';
import 'package:v2/model/base_entity.dart';
import 'package:v2/model/country_data.dart';
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
  int zb_id;
  final int status;
  final int birth_year;
  final int gender;

  final String district1;
  final String district2;

  final String sn;

  final ClassInfo classInfo;
  StaffInfo staff;

  /// Class ID in zhibei.info.
  ///
  /// This might be different from zb_id of [classInfo] since
  /// a user might exist in zhibei.info but in a different class,
  /// and needs to sync up.
  int pre_classID;

  User.fromJson(Map<String, dynamic> map)
      : name = map['name'],
        id = map['id'] == null ? null : int.parse(map['id']),
        zb_id = int.tryParse(map['zb_id']?.toString() ?? map['userID'] ?? ''),
        email = map['email'],
        nickName = map['nickname'],
        education = int.tryParse(map['education']?.toString() ?? ''),
        occupation = map['job'] ?? _truncate(map['occupation'], 16) ?? '无',
        skills = map['skills'],
        sn = map['sn'] ?? map['internal_id'],
        birth_year = int.tryParse(
            map['birth_year'] ?? map['birthyear']?.toString() ?? ''),
        gender =
            map['sex'] == null ? _getGenderCode(map['gender']) : 1 - map['sex'],
        status = int.parse(map['status'] ?? '0'),
        district1 =
            map['district1'] ?? _DistrictUtil.getCountryLabel(map['country']),
        district2 = map['district2'] ??
            _DistrictUtil.getStateCityLabel(
                map['country'], map['state'], map['city']),
        classInfo = ClassInfo.fromJson(map['classInfo'] ?? {}),
        super.fromJson({});

  @override
  int get userID => zb_id;
  set userID(int userID) => zb_id = userID;

  String get job => occupation;
  bool get isActive => status == 0;

  @override
  bool get isEmpty => false;

  @override
  bool get isNotEmpty => !isEmpty;

  @override
  bool operator ==(that) {
    if (that is! User) return false;
    var another = that as User;
    return sn == another.sn &&
        name == another.name &&
        birth_year == another.birth_year &&
        gender == another.gender &&
        district1 == another.district1 &&
        district2 == another.district2 &&
        job == another.job;
  }

  String get displayLabel => nickName?.isNotEmpty == true
      ? '$name($nickName) - $email'
      : '$name-$email';

  Map<String, String> toMap({BaseEntity remote}) {
    return <String, String>{
      'rid': 'user',
      'id': '$id',
      'name': name,
      'email': email,
      'nickname': nickName,
      'education': education?.toString(),
      'job': job,
      'occupation': occupation,
      'skills': skills,
      'sn': sn,
      'internal_id': sn,
      'gender': gender?.toString(),
      'sex': '${1 - (gender ?? 0)}',
      'userID': '$userID',
      'birth_year': birth_year?.toString(),
    };
  }

  static int _getGenderCode(String label) => {'男': 0, '女': 1}[label];

  static String _truncate(String s, int len) =>
      s == null ? null : s.substring(0, min(len - 1, s.length));
}

class StaffInfo extends BaseEntity {
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

  Map<String, String> toMap({BaseEntity remote}) {
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

class _DistrictUtil {
  static String _getStateCode(String countryCode, int stateIndex) {
    var countryData = getCountryData();
    var index = countryData.getCountryIndex(countryCode);
    var state = countryData.getState(index, stateIndex);
    return countryCode == 'US' ? countryData.getUSStateCode(state) : state;
  }

  static getStateCityLabel(String countryCode, int stateIndex, String city) =>
      stateIndex == null
          ? null
          : '${_getStateCode(countryCode, stateIndex)}-$city';

  static String getCountryLabel(String code) {
    return getCountryData().getCountryLabel(code);
  }
}
