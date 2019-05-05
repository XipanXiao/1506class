class ClassInfo {
  final String name;
  final String class_room;

  ClassInfo(this.name, this.class_room);

  ClassInfo.fromJson(Map<String, dynamic> map)
      : name = map['name'],
        class_room = map['class_room'];
}
