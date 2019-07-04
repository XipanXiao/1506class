import 'package:v2/model/report_grid.dart';

class ClassInfo {
  final int id;
  final int zb_id;
  final int start_year;
  final int department_id;

  final String name;
  final String class_room;

  int half_term;
  ReportGrid taskGrid;

  ClassInfo.fromJson(Map<String, dynamic> map)
      : id = map['id'],
        zb_id = map['zb_id'],
        department_id = map['department_id'],
        name = map['name'],
        class_room = map['class_room'],
        start_year = map['start_year'];
}
