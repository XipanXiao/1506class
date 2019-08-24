import 'package:v2/model/class_task_data.dart';

import 'base_entity.dart';

/// Base structure to encode/decode zhibei.info task data.
class TaskData implements BaseEntity {
  final int operation;
  final int user_style;

  /// zhibei.info user id.
  final int userID;

  /// User name.
  final String name;

  /// bicw user id.
  int id;

  /// Times of attendence of this user for
  /// a specific half term.
  int att = 0;

  TaskData.fromJson(Map<String, dynamic> map)
      : id = map['id'],
        userID = int.tryParse(map['userID'] ?? ''),
        name = map['name'],
        att = map['att'] ?? 0,
        operation = int.tryParse(map['operation'] ?? ''),
        user_style = int.tryParse(map['user_style'] ?? '');

  TaskData clone() {
    return TaskData.fromJson({
      'id': id,
      'userID': userID,
      'name': name,
      'att': att
    });
  }

  @override
  int get hashCode => id.hashCode;

  @override
  bool operator==(that) {
    if (that is! TaskData) return false;
    return (att ?? 0) == ((that as TaskData).att ?? 0);
  }

  @override
  Map<String, String> toMap() {
    return {
      'userID': userID.toString(),
      'att': att?.toString(),
    };
  }

  /// Whether there is any meaningful data.
  bool get isEmpty => (att ?? 0) == 0;
  bool get isNotEmpty => (att ?? 0) != 0;

  /// Initializes all members whose name end with '_total' to 0.
  void initTotal() {}

  /// Whether the '_total' memebers are all equal.
  bool sameTotal(TaskData that) => false;

  /// Moves data from [this] object to the first reportable term.
  ///
  /// When a field is reportable, zhibei.info returns a non-null
  /// value for that field. For example, for the first several
  /// half terms, the `baiziming` field is always null.
  void moveToFirstReportableTerm(
      Map<int, ClassTaskData> taskData, int fromTerm) {}
}

typedef T TaskDataFromJson<T>(Map<String, dynamic> json);
