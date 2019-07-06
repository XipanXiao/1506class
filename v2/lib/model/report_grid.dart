import 'package:v2/model/zb_task_data.dart';

class Lesson {
  final int lesson_id;
  final String name;

  Lesson(this.lesson_id, this.name);
}

class ReportGrid<T extends TaskData> {
  /// zhibei.info Lesson ID.
  final int courseID;

  /// zhibei.info report grid type.
  final String grid_type;

  /// zhibei.info main course lessons list.
  final lessons = <Lesson>[];

  /// zhibei.info class id.
  int pre_classID;

  /// A map from zhibei id to bicw id.
  final userIdMap = <int, int>{};

  /// Bicw and zhibei.info task data.
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
  final taskData = <int, Map<int, TaskDataPair<T>>>{};

  ReportGrid(this.courseID, this.grid_type);

  String lessonQuery(int half_term) => 'courseID=$courseID&half_term=$half_term'
      '&type=pre_class_lessons&pre_classID=$pre_classID';

  /// Adds loaded task data to this grid.
  void setTaskData(Map<int, Map<int, TaskData>> data, {bool zhibei = false}) {
    for (var halfTerm in data.keys) {
      var dest = taskData.putIfAbsent(halfTerm, () => <int, TaskDataPair<T>>{});
      for (var user in data[halfTerm].values) {
        var id = zhibei ? userIdMap[user.userID] : user.id;
        var destUser = dest.putIfAbsent(id, () => TaskDataPair<T>());
        if (zhibei) {
          destUser.zhibeiData = user;
          destUser.audit();
        } else {
          destUser.bicwData = user;
        }
      }
    }
  }

  /// Check whether task data of [half_term] are fully loaded.
  bool isLoaded(half_term) {
    var halfTermData = taskData[half_term];
    if (halfTermData == null) return false;
    return halfTermData.values.any((user) => user.zhibeiData != null);
  }

  /// Clears zhibei.info cache for [halfTerm].
  void clearCache(int halfTerm) {
    var halfTermData = taskData[halfTerm];
    if (halfTermData == null) return;
    for (var user in halfTermData.values) {
      user.zhibeiData = null;
    }
  }
}
