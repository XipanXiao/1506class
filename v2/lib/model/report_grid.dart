import 'package:v2/model/course.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/zb_task_data.dart';

import 'lesson.dart';

class GridTypes {
  /// The grid type parameter when fetching schedule records
  /// from zhibei.info.
  final String main_course_grid = 'main_course_grid';

  /// The grid type parameter when reporting schedule records
  /// to zhibei.info.
  final String report_main_grid;
  final String workGrid;
  final String attLimitGrid;

  /// The grid type parameter when reporting jiaxing
  /// guanxiu task data to zhibei.info.
  final String guanxiuGrid = 'guanxiu_grid';

  GridTypes({this.report_main_grid, this.workGrid, this.attLimitGrid});
}

abstract class ReportGrid<T extends TaskData> {
  /// All possible half terms.
  static final halfTerms = List<int>.generate(17, (index) => index + 1)
    ..remove(1)
    ..remove(3);

  /// zhibei.info Lesson ID.
  final int courseID;

  /// zhibei.info main course lessons list.
  final lessons = <int, List<Lesson>>{};

  /// bicw course map, keyed by bicw course id.
  final courses = <int, Course>{};

  /// zhibei.info class id.
  int pre_classID;

  /// A map from zhibei id to bicw id.
  final userIdMap = <int, int>{};

  /// A map from bicw [Course] id to zhibei [Lesson] id.
  final _courseIdMap = <int, int>{};

  /// Set of visible column names.
  final columns = <String>{};

  /// Bicw and zhibei.info task data.
  ///
  /// It is a map of maps (from bicw user id to her task
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

  GridTypes get gridTypes;

  ReportGrid(this.courseID);

  /// Adds loaded task data to this grid.
  void setTaskData(Map<int, Map<int, TaskData>> data, {bool zhibei = false}) {
    for (var halfTerm in data.keys) {
      var dest = taskData.putIfAbsent(halfTerm, () => <int, TaskDataPair<T>>{});
      for (var user in data[halfTerm].values) {
        var id = zhibei ? (userIdMap[user.userID] ?? user.userID) : user.id;
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

  /// Check whether schedule task data of [half_term] are fully loaded.
  bool isScheduleLoaded(half_term) {
    var halfTermData = taskData[half_term];
    if (halfTermData == null) return false;
    return halfTermData.values
        .any((user) => user.zhibeiData?.scheduleRecords?.isNotEmpty == true);
  }

  /// Clears zhibei.info schedule data cache for [halfTerm].
  void clearScheduleCache(int halfTerm) {
    var halfTermData = taskData[halfTerm];
    if (halfTermData == null) return;
    for (var user in halfTermData.values) {
      user.zhibeiData?.scheduleRecords?.clear();
    }
  }

  /// Stores the [scheduleRecords] from zhibei.info here.
  ///
  /// The records are keyed by zhibei user ID. For each user,
  /// the map is keyed by zhibei lesson id.
  void setZBScheduleRecords(
      int halfTerm, Map<int, Map<int, ScheduleRecord>> scheduleRecords) {
    var users = taskData[halfTerm];
    for (var userID in scheduleRecords.keys) {
      var user = users[userIdMap[userID]];
      if (user == null) continue;
      user.zhibeiData.scheduleRecords.addAll(scheduleRecords[userID]);
    }
  }

  /// Builds a map from a zhibei [Lesson] name to a List of
  /// bicw [Course] IDs.
  Map<String, List<int>> get _courseNameMap {
    var map = <String, List<int>>{};
    for (var course in courses.values) {
      var list = map.putIfAbsent(course.zb_name, () => <int>[]);
      list.add(course.id);
    }
    return map;
  }

  /// Returns zhibei [Lesson]'s for [halfTerm].
  List<Lesson> getLessons(int halfTerm) => lessons[halfTerm];

  /// Sets zhibei [Lesson]'s for [halfTerm].
  void setLessons(int halfTerm, List<Lesson> lessons) {
    var halfTermData = this.lessons.putIfAbsent(halfTerm, () => <Lesson>[]);
    halfTermData.addAll(lessons);

    var nameMap = _courseNameMap;
    for (var lesson in lessons) {
      for (var id in nameMap[lesson.name]) {
        _courseIdMap[id] = lesson.lesson_id;
      }
    }

    _convertScheduleRecordsMap(halfTerm);
  }

  /// Converts the scheduleRecords map of the bicwData of [user],
  /// to a new map from zhibei [Lesson] IDs to [ScheduleRecord]s.
  void _convertScheduleRecordsMap(int halfTerm) {
    var halfTermUsers = taskData[halfTerm];
    for (var user in halfTermUsers.values) {
      var map = user.bicwData.scheduleRecords
          .map((id, course) => MapEntry(_courseIdMap[id], course));
      user.bicwData.scheduleRecords
        ..clear()
        ..addAll(map);
    }
  }
}
