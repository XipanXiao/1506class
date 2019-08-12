import 'has_schedule_records.dart';

/// Model class for the 'schedule_records' database table.
class ScheduleRecord implements AbstractScheduleRecord {
  final int student_id;
  final int course_id;
  final int half_term;

  bool attended;
  final bool video;
  final bool text;

  ScheduleRecord.fromJson(Map<String, dynamic> map)
      : student_id = int.tryParse(map['student_id'] ?? ''),
        course_id = int.tryParse(map['course_id'] ?? ''),
        half_term = int.tryParse(map['half_term'] ?? ''),
        attended = int.parse(map['attended'] ?? '0') == 1,
        video = int.parse(map['video'] ?? '0') == 1,
        text = int.parse(map['text'] ?? '0') == 1;

  bool get isNotEmpty => video == true || text == true;

  @override
  int get hashCode => (video == true ? 2 : 0) + (text == true ? 1 : 0);

  @override
  bool operator ==(that) {
    if (that is! ScheduleRecord) return false;
    return (that.video ?? false) == (video ?? false) &&
        (that.text ?? false) == (text ?? false);
  }
}
