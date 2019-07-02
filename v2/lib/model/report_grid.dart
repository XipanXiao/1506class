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

  /// zhibei.info class id.
  int pre_classID;

  ReportGrid(this.courseID, this.grid_type);

  String lessonQuery(int half_term) => 'courseID=$courseID&half_term=$half_term'
      '&type=pre_class_lessons&pre_classID=$pre_classID';

  String taskDataQuery(int half_term) =>
      'type=$grid_type&pre_classID=$pre_classID&half_term=$half_term';
}

class TaskData {
  /// bicw id.
  int id;

  final String name;

  TaskData({this.id, this.name});

  TaskData.fromJson(Map<String, dynamic> map)
      : id = map['id'],
        name = map['name'];
}

typedef T TaskDataFromJson<T>(Map<String, dynamic> json);

class RxlTaskData extends TaskData {
  final int operation;
  final int select_all;

  /// zhibei.info id.
  final int userID;

  final int user_style;

  int att;
  int gx_count;
  double gx_time;
  int mantra_count;
  int mantra_total;

  RxlTaskData(
      {int id,
      String name,
      this.att,
      this.gx_count,
      this.gx_time,
      this.mantra_count,
      this.mantra_total,
      this.operation,
      this.select_all,
      this.user_style,
      this.userID})
      : super(id: id, name: name);

  RxlTaskData.fromJson(Map<String, dynamic> map)
      : att = map['att'],
        gx_count = map['gx_count'] ?? 0,
        gx_time = map['gx_time'] ?? 0,
        mantra_count = map['mantra_count'] ?? 0,
        mantra_total = map['mantra_total'] ?? 0,
        operation = int.tryParse(map['operation'] ?? ''),
        select_all = int.tryParse(map['select_all'] ?? ''),
        user_style = int.tryParse(map['user_style'] ?? ''),
        userID = int.tryParse(map['userID'] ?? ''),
        super.fromJson(map);
}

class RxlTaskGrid extends ReportGrid {
  /// Bicw task data.
  ///
  /// It is a map of maps (from user id to her task
  /// data of a certain half_term). Then the outer map has
  /// all half_terms. Like
  ///
  /// half_term 0, 1, 3 has a null map.
  /// half_term 2 has a map like
  /// {
  ///   user_id1: user1 task data of the first term,
  ///   user_id2: user2 task data of the first term,
  ///   user_id3: user3 task data of the first term,
  /// }
  /// ...
  final taskData = <int, Map<int, RxlTaskData>>{};

  /// zhibein.info task data.
  ///
  /// It has the same structure of the above bicw
  /// [taskData]. The only difference is, the maps
  /// are from the zb_id to RxlTaskData.
  final zbTaskData = <int, Map<int, RxlTaskData>>{};

  RxlTaskGrid() : super(2, 'rxl_work_grid');

  void setTaskData(Map<int, Map<int, RxlTaskData>> data) {
    if (data.isEmpty) return;

    var lastTerm = data.values.last;
    for (var halfTerm in data.values) {
      for (var user in halfTerm.values) {
        lastTerm[user.id].mantra_total += user.mantra_count;
      }
    }
    for (var halfTerm in data.values) {
      for (var user in halfTerm.values) {
        user.mantra_total = lastTerm[user.id].mantra_total;
      }
    }
    taskData
      ..clear()
      ..addAll(data);
  }
}
