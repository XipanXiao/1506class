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
  final int enroll_tasks;
  final int yy;

  final String district1;
  final String district2;
  final String note;
  final String ts;

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
        enroll_tasks = map['enroll_tasks'] ?? 0,
        ts = map['ts'],
        yy = map['yy'],
        note = map['note'] ?? map['comments'],
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
      'education': (remote == null ? education : _zb_edu)?.toString(),
      'job': job,
      'occupation': occupation,
      'skills': skills,
      'sn': sn,
      'internal_id': sn,
      'gender': gender?.toString(),
      'sex': '${1 - (gender ?? 0)}',
      'userID': '$userID',
      'zb_id': '$userID',
      'birth_year': birth_year?.toString(),
      'district1': district1,
      'district2': district2,
      'lifelong': _EnrollTaskUtil.lifelong(enroll_tasks),
      'position': '',
      'is_fdy': '0',
      'is_ytb': _EnrollTaskUtil.is_ytb(enroll_tasks),
      'study_style': _EnrollTaskUtil.study_style(enroll_tasks),
      'onlywensi': _EnrollTaskUtil.onlywensi(enroll_tasks),
      'note': note,
    };
  }

  int get _zb_edu => education == null ? 0 : education + 3;

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

class _EnrollTaskUtil {
  // Index of bit in the user.enroll_tasks bits.
  // Indicating whether welcome letter is sent.
  static const welcomeIndex = 0;
  // Indicating whether the user joined wechat group.
  static const wechatIndex = 1;
  // Indicating whether yy client is installed.
  static const yyIndex = 2;
  // Indicating whether yy client is tested.
  static const yyTestIndex = 3;
  // Indicating whether book order is placed (or omitted).
  static const bookOrderIndex = 4;
  // Indicating whether the student is in the workshop class.
  static const workshopIndex = 5;
  // Indicating whether the student is permanent or not.
  static const permanentIndex = 6;
  // Indicating whether the student is self learning or not.
  static const selfLearningIndex = 7;
  // Indicating whether the student don't practice.
  static const wensiIndex = 8;

  static String lifelong(int bits) =>
      (bits & (1 << permanentIndex)) != 0 ? '1' : '0';
  static String is_ytb(int bits) =>
      (bits & (1 << workshopIndex)) != 0 ? '1' : '0';
  static String study_style(int bits) =>
      (bits & (1 << selfLearningIndex)) != 0 ? '1' : '0';
  static String onlywensi(int bits) =>
      (bits & (1 << wensiIndex)) != 0 ? '1' : '0';
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
