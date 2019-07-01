import 'dart:async';
import 'dart:math';

import 'package:angular/angular.dart';
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

  Map<int, RxlTaskData> _parseRxlTaskStats(
      List records, Map<int, User> users, Map<int, Task> tasks) {
    var rawRecords = Map<int, Map<String, dynamic>>.fromIterables(users.keys,
        users.values.map((user) => {'name': user.name, 'userID': user.zb_id}));
    for (var record in records) {
      var taskRecord = TaskRecord.fromJson(record);
      var task = tasks[taskRecord.task_id];

      var rawRecord = rawRecords[taskRecord.student_id];
      rawRecord['${task.zb_name}_count'] = taskRecord.count;
      if (task.duration != 0) {
        rawRecord['${task.zb_name}_time'] =
            _toGuanxiuHour(taskRecord.duration ?? 0);
      }
    }
    return rawRecords.map<int, RxlTaskData>((id, data) =>
        MapEntry<int, RxlTaskData>(id, RxlTaskData.fromJson(data)));
  }

  Future<Map<int, RxlTaskData>> getRxlTaskRecords(
      int classId, String reportGrid, int half_term) async {
    var url = '$_serviceUrl?rid=task_records&grid_type=$reportGrid'
        '&classId=$classId&half_term=$half_term';

    Map map = await utils.httpGetObject(url);
    var tasks = map['tasks'].map<Task>((task) => Task.fromJson(task));
    var users = map['users'].values.map<User>((task) => User.fromJson(task));

    return _parseRxlTaskStats(
        map['records'] as List,
        Map<int, User>.fromIterable(users, key: (user) => user.id),
        Map<int, Task>.fromIterable(tasks, key: (task) => task.id));
  }

  Future<int> getLastHalfTerm(int classId) async {
    var url = '$_serviceUrl?rid=half_term&classId=$classId';

    Map map = await utils.httpGetObject(url);
    return map['half_term'];
  }
}
