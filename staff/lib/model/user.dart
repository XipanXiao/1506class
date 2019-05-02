import 'class_info.dart';

class User {
  final String name;
  final String email;
  final int id;

  final ClassInfo classInfo;

  User(this.name, this.email, this.id, this.classInfo);

  User.fromJson(Map<String, dynamic> map)
      : name = map['name'],
        email = map['email'],
        id = int.parse(map['id']),
        classInfo = ClassInfo.fromJson(map['classInfo']);
}
