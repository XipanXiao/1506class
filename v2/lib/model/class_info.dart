class ClassInfo {
  final int id;
  final int start_year;

  final String name;
  final String class_room;

  ClassInfo(this.id, this.name, this.class_room, this.start_year);

  ClassInfo.fromJson(Map<String, dynamic> map)
      : id = map['id'],
        name = map['name'],
        class_room = map['class_room'],
        start_year = map['start_year'];
}
