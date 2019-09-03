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
  int zb_id;
  final int status;
  final int birth_year;
  final int gender;

  final String district1;
  final String district2;

  final String job;

  final String sn;

  final ClassInfo classInfo;
  StaffInfo staff;

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
        gender =
            map['sex'] == null ? _getGenderCode(map['gender']) : 1 - map['sex'],
        status = int.parse(map['status'] ?? '0'),
        district1 = map['district1'] ?? _getCountryLabel(map['country']),
        district2 = map['district2'] ??
            _DistrictUtil.getStateCityLabel(map['state'], map['city']),
        job = map['job'] ?? map['occupation'],
        classInfo = ClassInfo.fromJson(map['classInfo'] ?? {}),
        super.fromJson({});

  @override
  int get userID => zb_id;
  set userID(int userID) => zb_id = userID;

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
        birth_year == another.birth_year &&
        gender == another.gender &&
        district1 == another.district1 &&
        district2 == another.district2 &&
        job == another.job;
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

  static String _getCountryLabel(String code) => {'US': 'United States'}[code];

  static int _getGenderCode(String label) => {'男': 0, '女': 1}[label];
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

class _DistrictUtil {
  static const _states =
      'Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|District of Columbia|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming';

  static final _labelToCode = _buildStateMap();

  static Map<String, String> _buildStateMap() {
    var codeToLabel = {
      'AL': 'Alabama',
      'AK': 'Alaska',
      'AS': 'American Samoa',
      'AZ': 'Arizona',
      'AR': 'Arkansas',
      'CA': 'California',
      'CO': 'Colorado',
      'CT': 'Connecticut',
      'DE': 'Delaware',
      'DC': 'District of Columbia',
      'FM': 'Federated States Of Micronesia',
      'FL': 'Florida',
      'GA': 'Georgia',
      'GU': 'Guam',
      'HI': 'Hawaii',
      'ID': 'Idaho',
      'IL': 'Illinois',
      'IN': 'Indiana',
      'IA': 'Iowa',
      'KS': 'Kansas',
      'KY': 'Kentucky',
      'LA': 'Louisiana',
      'ME': 'Maine',
      'MH': 'Marshall Islands',
      'MD': 'Maryland',
      'MA': 'Massachusetts',
      'MI': 'Michigan',
      'MN': 'Minnesota',
      'MS': 'Mississippi',
      'MO': 'Missouri',
      'MT': 'Montana',
      'NE': 'Nebraska',
      'NV': 'Nevada',
      'NH': 'New Hampshire',
      'NJ': 'New Jersey',
      'NM': 'New Mexico',
      'NY': 'New York',
      'NC': 'North Carolina',
      'ND': 'North Dakota',
      'MP': 'Northern Mariana Islands',
      'OH': 'Ohio',
      'OK': 'Oklahoma',
      'OR': 'Oregon',
      'PW': 'Palau',
      'PA': 'Pennsylvania',
      'PR': 'Puerto Rico',
      'RI': 'Rhode Island',
      'SC': 'South Carolina',
      'SD': 'South Dakota',
      'TN': 'Tennessee',
      'TX': 'Texas',
      'UT': 'Utah',
      'VT': 'Vermont',
      'VI': 'Virgin Islands',
      'VA': 'Virginia',
      'WA': 'Washington',
      'WV': 'West Virginia',
      'WI': 'Wisconsin',
      'WY': 'Wyoming'
    };
    return Map.fromIterable(codeToLabel.keys, key: (code) => codeToLabel[code]);
  }

  static String _getStateLabel(int index) => _states.split('|')[index];

  static String _getStateCode(int index) {
    var state = _getStateLabel(index);
    return _labelToCode[state];
  }

  static getStateCityLabel(int stateIndex, String city) =>
      '${_getStateCode(stateIndex)}-$city';
}
