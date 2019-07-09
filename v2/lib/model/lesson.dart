class Lesson {
  final int lesson_id;
  final String name;

  Lesson(this.lesson_id, this.name);

  Lesson.fromJson(Map<String, dynamic> map)
      : lesson_id = int.parse(map['lesson_id']),
        name = map['name'];
}
