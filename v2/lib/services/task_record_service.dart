import 'dart:async';
import 'dart:math';

import 'package:angular/angular.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/task.dart';
import 'package:v2/model/task_data.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/user.dart';
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

  void _parseAttendance<T extends TaskData>(
      Iterable<ScheduleRecord> schedules, Map<int, Map<int, T>> stats) {
    for (var schedule in schedules) {
      var halfTerm = stats[schedule.half_term];
      if (halfTerm == null) continue;
      var user = halfTerm[schedule.student_id];
      user?.att += (schedule.attended ? 1 : 0);
    }
  }

  Future<Map<int, Map<int, T>>> getTaskDataStats<T extends TaskData>(
      int classId, TaskDataFromJson<T> creator) async {
    var url = '$_serviceUrl?rid=task_records&classId=$classId';

    Map map = await utils.httpGetObject(url);
    var tasks = map['tasks'].map<Task>((task) => Task.fromJson(task));
    var users = map['users'].values.map<User>((task) => User.fromJson(task));

    var stats = _parseTaskStats(
        map['records'] as List,
        Map<int, User>.fromIterable(users, key: (user) => user.id),
        Map<int, Task>.fromIterable(tasks, key: (task) => task.id),
        creator);

    var schedules = map['schedules']
        .map<ScheduleRecord>((map) => ScheduleRecord.fromJson(map));

    _parseAttendance(schedules, stats);
    return stats;
  }

  Future<int> getLastHalfTerm(int classId) async {
    var url = '$_serviceUrl?rid=half_term&classId=$classId';

    Map map = await utils.httpGetObject(url);
    return map['half_term'];
  }
}
