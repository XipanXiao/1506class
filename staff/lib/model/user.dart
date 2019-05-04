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
  StaffInfo.fromJson(dynamic map)
      : organization = int.parse(map['organization']);
}
