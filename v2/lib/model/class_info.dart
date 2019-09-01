import 'package:v2/model/base_entity.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/user.dart';

class ClassInfo extends BaseEntity {
  final int id;
  int zb_id;
  final int start_year;
  final int department_id;

  final String name;
  final String class_room;

  /// Cached task data.
  ReportGrid taskGrid;

  /// A list of pair of [User]s.
  final users = <TaskDataPair<User>>[];

  ClassInfo.fromJson(Map<String, dynamic> map)
      : id = map['id'],
        zb_id = map['zb_id'],
        department_id = map['department_id'],
        name = map['name'],
        class_room = map['class_room'],
        start_year = map['start_year'];

  @override
  Map<String, String> toMap() {
    return {
      'id': id?.toString(),
      'zb_id': zb_id?.toString(),
      'start_year': start_year?.toString(),
      'department_id': department_id?.toString(),
      'name': name,
      'class_root': class_room,
    };
  }
}
