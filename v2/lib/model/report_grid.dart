class Lesson {
  final int lesson_id;
  final String name;

  Lesson(this.lesson_id, this.name);
}

class ReportGrid {
  /// zhibei.info Lesson ID.
  final int courseID;

  /// zhibei.info report grid type.
  final String grid_type;

  /// zhibei.info main course lessons list.
  final lessons = <Lesson>[];

  int half_term;
  int pre_classID;

  ReportGrid(this.courseID, this.grid_type);

  String get lessonQuery => 'courseID=$courseID&half_term=$half_term'
      '&type=pre_class_lessons&pre_classID=$pre_classID';

  String get taskDataQuery =>
      'type=$grid_type&pre_classID=$pre_classID&half_term=$half_term';
}

class TaskData {}

class RxlTaskData extends TaskData {
  final int att;
  final int gx_count;
  final double gx_time;
  final int mantra_count;
  final int mantra_total;
  final String name;
  final int operation;
  final int select_all;
  final int userID;
  final int user_style;

  RxlTaskData(
      {this.att,
      this.gx_count,
      this.gx_time,
      this.mantra_count,
      this.mantra_total,
      this.name,
      this.operation,
      this.select_all,
      this.user_style,
      this.userID});

  RxlTaskData.fromJson(Map<String, dynamic> map)
      : att = map['att'],
        gx_count = map['gx_count'],
        gx_time = map['gx_time'],
        mantra_count = map['mantra_count'],
        mantra_total = map['mantra_total'],
        name = map['name'],
        operation = int.parse(map['operation']),
        select_all = int.parse(map['select_all']),
        user_style = int.parse(map['user_style']),
        userID = int.parse(map['userID']);
}

class RxlTaskGrid extends ReportGrid {
  /// zhibein.info task data.
  final taskData = <RxlTaskData>[];

  RxlTaskGrid() : super(2, 'rxl_work_grid');
}
