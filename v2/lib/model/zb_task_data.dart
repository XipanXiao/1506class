import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/task_data_pair.dart';

import 'base_entity.dart';

/// Base structure to encode/decode zhibei.info task data.
abstract class TaskData extends BaseEntity {
  final int operation;
  final int user_style;

  /// zhibei.info user id.
  final int userID;

  /// User name.
  final String name;

  /// Schedule task records, keyed by bicw course id or
  /// zhibei lesson ids.
  ///
  /// When being compared, they're both keyed by zhibei
  /// lesson ids.
  final scheduleRecords = <int, ScheduleRecord>{};

  /// Schedule task records for limited courses.
  final limitRecords = <int, ScheduleRecord>{};

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

  @override
  int get hashCode => id.hashCode;

  @override
  Map<String, String> toMap() {
    return {
      'userID': userID.toString(),
      'att': att?.toString(),
    };
  }

  /// Whether there is any meaningful data.
  bool get isEmpty => true;
  bool get isNotEmpty => !isEmpty;

  /// Initializes all members whose name end with '_total' to 0.
  void initTotal();

  /// Whether the '_total' memebers are all equal.
  bool sameTotal(TaskData that);

  /// Moves data from [this] object to the first reportable term.
  ///
  /// When a field is reportable, zhibei.info returns a non-null
  /// value for that field. For example, for the first several
  /// half terms, the `baiziming` field is always null.
  void moveToFirstReportableTerm(
      Map<int, Map<int, TaskDataPair>> taskData, int fromTerm) {}
}

typedef T TaskDataFromJson<T>(Map<String, dynamic> json);
