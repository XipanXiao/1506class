import 'class_info.dart';

class User {
  String name;
  String email;
  final int id;

  final ClassInfo classInfo;
  StaffInfo staff;

  User(this.name, this.email, this.id, this.classInfo, this.staff);

  User.fromJson(Map<String, dynamic> map)
      : name = map['name'],
        email = map['email'],
        id = int.parse(map['id']),
        classInfo = ClassInfo.fromJson(map['classInfo']);
}

class StaffInfo {
  int organization;
  int title;
  int free_time;

  String position;

  StaffInfo.fromJson(dynamic map)
      : position = map['position'],
      title = int.tryParse(map['title'] ?? ''),
      free_time = int.tryParse(map['free_time'] ?? ''),
      organization = int.tryParse(map['organization'] ?? '');
}
