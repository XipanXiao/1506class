/// Model of the bicw 'task_records' database table.
class TaskRecord {
  final int student_id;
  final int task_id;
  final int count;
  final int duration;
  final int sub_index;
  final int half_term;

  TaskRecord.fromJson(Map<String, dynamic> map)
      : student_id = int.parse(map['student_id']),
        task_id = int.parse(map['task_id']),
        count = int.parse(map['count']),
        duration = int.tryParse(map['duration'] ?? ''),
        sub_index = int.parse(map['sub_index']),
        half_term = int.tryParse(map['half_term'] ?? '');
}
