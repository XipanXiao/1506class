import 'course.dart';

class Schedule {
  final int id;
  final int course_id;
  final int course_id2;
  final int teacher_planned;
  final int teacher;
  final int review;
  final int open;
  final String notes;

  Schedule.fromJson(Map<String, dynamic> map)
      : id = int.parse(map['id']),
        course_id = int.tryParse(map['course_id'] ?? ''),
        course_id2 = int.tryParse(map['course_id2'] ?? ''),
        teacher_planned = int.tryParse(map['teacher_planned'] ?? ''),
        teacher = int.tryParse(map['teacher'] ?? ''),
        review = int.tryParse(map['review'] ?? ''),
        open = int.tryParse(map['open'] ?? ''),
        notes = map['notes'];
}

class ScheduleGroup {
  final int id;
  final int classId;
  final int term;
  final int end_time;
  final int mid_week;
  final Map<int, Course> courses;
  final List<Schedule> schedules;

  ScheduleGroup.fromJson(Map<String, dynamic> map)
      : id = int.parse(map['id']),
        classId = int.parse(map['classId']),
        term = map['term'],
        end_time = map['end_time'],
        mid_week = map['mid_week'],
        courses = _extractCourses(map['courses']),
        schedules = _extractSchedules(map['schedules']);

  static Map<int, Course> _extractCourses(map) => map
      .map<int, Course>((key, value) => MapEntry(int.parse(key), Course.fromJson(value)));

  static List<Schedule> _extractSchedules(map) =>
      map.values.map<Schedule>((value) => Schedule.fromJson(value)).toList();
}
