class Course {
  final int id;
  final String name;
  final String zb_name;

  Course.fromJson(Map<String, dynamic> map)
      : id = int.parse(map['id']),
        name = map['name'],
        zb_name = map['zb_name'];
}
