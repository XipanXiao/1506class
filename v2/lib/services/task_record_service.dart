import 'dart:async';
import 'dart:math';

import 'package:angular/angular.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/schedule.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/schedule_task_data.dart';
import 'package:v2/model/task.dart';
import 'package:v2/model/task_record.dart';
import 'package:v2/model/user.dart';
import 'package:v2/model/zb_task_data.dart';
import 'package:v2/utils.dart' as utils;

@Injectable()
class TaskRecordService {
  static const _serviceUrl = 'php/task_records.php';

  double _toGuanxiuHour(int minutes) =>
      double.parse(min(minutes / 60.0, 25.5).toStringAsFixed(1));

  Map<int, Map<int, T>> _parseTaskStats<T>(List records, Map<int, User> users,
      Map<int, Task> tasks, TaskDataFromJson<T> creator) {
    var rawRecords = <int, Map<int, Map<String, dynamic>>>{};

    // Collect raw stats from raw records.
    for (var record in records) {
      var taskRecord = TaskRecord.fromJson(record);
      int half_term = taskRecord.half_term;
      if (half_term == null || half_term == 0) continue;

      var halfTermData = rawRecords.putIfAbsent(half_term, () {
        return Map<int, Map<String, dynamic>>.fromIterables(
            users.keys,
            users.values.map((user) =>
                {'id': user.id, 'name': user.name, 'userID': user.zb_id}));
      });

      var task = tasks[taskRecord.task_id];
      var rawRecord = halfTermData[taskRecord.student_id];
      rawRecord['${task.zb_name}_count'] = taskRecord.count;
      if (task.duration != 0) {
        rawRecord['${task.zb_name}_time'] =
            _toGuanxiuHour(taskRecord.duration ?? 0);
      }
    }

    // Convert collected raw stats to resulting [TaskData].
    var halfTerms = <int, Map<int, T>>{};
    for (var half_term in rawRecords.keys) {
      var halfTermRawData = rawRecords[half_term];
      halfTerms[half_term] = halfTermRawData
          .map<int, T>((id, data) => MapEntry<int, T>(id, creator(data)));
    }
    return halfTerms;
  }

  /// Returns a map from course id to its associated schedule id.
  Map<int, int> _buildCourseScheduleMap(Iterable<Schedule> schedules) {
    var courses = <int, int>{};
    for (var schedule in schedules) {
      courses[schedule.course_id] = schedule.id;
      courses[schedule.course_id2] = schedule.id;
    }
    return courses;
  }

  /// Merges attendance records to remove duplicated records,
  /// for those schedules having two courses.
  ///
  /// [{course_id_1, attended_1}, {course_id_2, attened}_2] will become
  /// [{course_id1, attended_1 || attended_2 }] if course 1 and course 2
  /// are in the same schedule.
  Iterable<ScheduleRecord> _mergeUserAttendanceRecords(
      Iterable<ScheduleRecord> scheduleRecords, Map<int, int> schedulesMap) {
    // Map from user id, schedule id pair to schedule record.
    var recordsMap = <int, Map<int, ScheduleRecord>>{};

    for (var record in scheduleRecords) {
      var attended = record.attended;
      if (!attended) continue;

      var student_id = record.student_id;
      var scheduleId = schedulesMap[record.course_id];
      var user =
          recordsMap.putIfAbsent(student_id, () => <int, ScheduleRecord>{});
      record = user.putIfAbsent(scheduleId, () => record);
      record.attended = record.attended || attended;
    }
    return recordsMap.values.expand((map) => map.values);
  }

  Future<Map<int, Map<int, T>>> getTaskDataStats<T extends TaskData>(
      int classId, TaskDataFromJson<T> creator) async {
    var url = '$_serviceUrl?rid=task_records&classId=$classId';

    Map map = await utils.httpGetObject(url);
    var tasks = map['tasks'].map<int, Task>(
        (id, task) => MapEntry(int.parse(id), Task.fromJson(task)));
    var users = map['users'].map<int, User>(
        (id, user) => MapEntry(int.parse(id), User.fromJson(user)));

    return _parseTaskStats(map['records'] as List, users, tasks, creator);
  }

  Future<int> getLastHalfTerm(int classId) async {
    var url = '$_serviceUrl?rid=half_term&classId=$classId';

    Map map = await utils.httpGetObject(url);
    return map['half_term'];
  }

  /// Returns the schedule records for the class identified by [classId].
  ///
  /// The returned map is keyed by bicw user IDs.
  Future<Map<int, ScheduleTaskData>> getScheduleRecords(int classId) async {
    var url = '$_serviceUrl?rid=schedule_records&classId=$classId';

    Map response = await utils.httpGetObject(url);
    Map<int, ScheduleTaskData> users = response['users']
        .map<int, ScheduleTaskData>((id, user) =>
            MapEntry(int.parse(id), ScheduleTaskData.fromJson(user)));

    for (var data in response['records']) {
      var record = ScheduleRecord.fromJson(data);
      users[record.student_id].addBicwScheduleRecord(record);
    }
    return users;
  }

  Future<Iterable<Schedule>> getSchedules(int classId) async {
    var url = '$_serviceUrl?rid=schedules&classId=$classId';

    List response = await utils.httpGetObject(url);
    return response.map<Schedule>((json) => Schedule.fromJson(json));
  }

  /// Given all [schedules] and all [scheduleRecords] of a certain
  /// class, collects attendance information of a certain [halfTerm].
  Map<int, TaskData> statAttendance(List<Schedule> schedules,
      Map<int, ScheduleTaskData> scheduleRecords, List<Lesson> lessons) {
    var schedulesMap = _buildCourseScheduleMap(schedules);

    return scheduleRecords.map((id, user) {
      var records = lessons
          .map((lesson) => user.scheduleRecords[lesson.lesson_id])
          .where((record) => record != null);
      records = _mergeUserAttendanceRecords(records, schedulesMap);
      int att =
          records.fold(0, (att, record) => att += record.attended ? 1 : 0);
      return MapEntry(
          id,
          TaskData.fromJson({
            'id': user.id,
            'userID': user.userID?.toString(),
            'name': user.name,
            'att': att,
          }));
    });
  }
}
