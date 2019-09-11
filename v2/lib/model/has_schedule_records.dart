import 'package:v2/model/base_entity.dart';
import 'package:v2/model/zb_task_data.dart';

import 'lesson.dart';

abstract class AbstractScheduleRecord {
  bool get isNotEmpty;
}

abstract class HasScheduleRecords {
  int get att;
  Map<int, AbstractScheduleRecord> get records;
}

abstract class TaskDataWithLessons extends TaskData
    implements HasScheduleRecords {
  List<Lesson> lessons;

  TaskDataWithLessons.fromJson(Map<String, dynamic> map) : super.fromJson(map);

  @override
  List<MapEntry<String, dynamic>> toFormData({BaseEntity remote});
}
