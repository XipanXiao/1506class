import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/zb_task_data.dart';

class ClassTaskData<T extends TaskData> {
  final users = <int, TaskDataPair<T>>{};

  Iterable<TaskDataPair<T>> get values => users.values;
  bool get isEmpty => users.isEmpty;
}
