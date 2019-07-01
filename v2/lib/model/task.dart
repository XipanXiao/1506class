/// Model of the 'tasks' database table.
class Task {
  final int id;
  final int department_id;
  final String name;
  final int max;
  final int duration;
  final int sub_tasks;
  final int starting_half_term;
  final String zb_name;
  final int zb_course_id;
  final int report_half_term;

  Task.fromJson(Map<String, dynamic> map)
      : id = int.parse(map['id']),
        department_id = int.tryParse('department_id'),
        name = map['name'],
        max = int.tryParse('max'),
        duration = int.tryParse('duration'),
        sub_tasks = int.tryParse('sub_tasks'),
        zb_name = map['zb_name'],
        zb_course_id = int.tryParse('zb_course_id'),
        starting_half_term = int.tryParse('starting_half_term'),
        report_half_term = int.tryParse('report_half_term');
}
