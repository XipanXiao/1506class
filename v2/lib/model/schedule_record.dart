/// Model class for the 'schedule_records' database table.
class ScheduleRecord {
  final int student_id;
  final int course_id;
  final int half_term;

  final bool attended;
  final bool video;
  final bool text;

  ScheduleRecord.fromJson(Map<String, dynamic> map)
      : student_id = int.parse(map['student_id']),
        course_id = int.parse(map['course_id']),
        half_term = int.tryParse(map['half_term'] ?? '0'),
        attended = int.parse(map['attended'] ?? '0') == 1,
        video = int.parse(map['video'] ?? '0') == 1,
        text = int.parse(map['text'] ?? '0') == 1;
}
