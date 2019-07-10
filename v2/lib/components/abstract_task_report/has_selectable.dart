import 'package:angular_components/model/selection/selection_model.dart';
import 'package:v2/model/zb_task_data.dart';

abstract class HasSelectable<T extends TaskData> {
  final selection = SelectionModel<TaskDataPair<T>>.multi();

  List<TaskDataPair<T>> get users;
  bool get allSelected => selection.selectedValues.length == users.length;

  void toggleSelectAll(String label) {
    if (label == true.toString()) {
      users.where((user) => user.reportable).forEach(selection.select);
    } else if (label == false.toString()) {
      selection.clear();
    }
  }

  void toggleSelection(TaskDataPair<T> user, bool checked) {
    if (checked) {
      selection.select(user);
    } else {
      selection.deselect(user);
    }
  }
}
