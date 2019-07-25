import 'package:angular_components/model/selection/selection_model.dart';
import 'package:v2/model/reportable.dart';

abstract class HasSelectable<T extends Reportable> {
  final selection = SelectionModel<T>.multi();

  List<T> get users;
  bool get allSelected => selection.selectedValues.length == users.length;

  void toggleSelectAll(String label) {
    if (label == true.toString()) {
      users.where((user) => user.reportable).forEach(selection.select);
    } else if (label == false.toString()) {
      selection.clear();
    }
  }

  void toggleSelection(T user, bool checked) {
    if (checked) {
      selection.select(user);
    } else {
      selection.deselect(user);
    }
  }
}
