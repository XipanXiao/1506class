import 'package:v2/model/base_entity.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/model/task_data_pair.dart';
import 'package:v2/model/user.dart';

class ClassInfo extends BaseEntity {
  final int id;
  int zb_id;
  final int start_year;
  final int department_id;

  final String name;
  final String class_room;

  /// Cached task data.
  ReportGrid taskGrid;

  /// A list of pair of [User]s.
  final users = <TaskDataPair<User>>[];

  ClassInfo.fromJson(Map<String, dynamic> map)
      : id = map['id'],
        zb_id = map['zb_id'],
        department_id = map['department_id'],
        name = map['name'],
        class_room = map['class_room'],
        start_year = map['start_year'];

  @override
  Map<String, String> toMap() {
    return {
      'id': id?.toString(),
      'zb_id': zb_id?.toString(),
      'start_year': start_year?.toString(),
      'department_id': department_id?.toString(),
      'name': name,
      'class_root': class_room,
    };
  }

  /// Merges information from [zbUsers] to the [users] list.
  Future<void> setZBUsers(
      Iterable<User> zbUsers,
      Future<void> Function(User) _updateBicwUser,
      Future<User> Function(int) _findZBUser) async {
    // Build a map from zb_id to User pair.
    var idMap = Map<int, TaskDataPair<User>>.fromIterable(users,
        key: (user) => user.bicwData.userID);
    // Another map from name to User pair.
    var nameMap = Map<String, TaskDataPair<User>>.fromIterable(users,
        key: (user) => user.name);

    for (var zbUser in zbUsers) {
      var pair = idMap[zbUser.userID] ?? nameMap[zbUser.name];
      if (pair == null) {
        // A user only exists from zhibei.info.
        if (zbUser.isActive) {
          users.add(TaskDataPair<User>()..zhibeiData = zbUser);
        }
      } else {
        if (pair.bicwData.userID == null) {
          // A user exists in both systems but not linked.
          pair.bicwData.userID = zbUser.userID;
          await _updateBicwUser(pair.bicwData);
        }
        pair.zhibeiData = zbUser;
      }
    }

    for (var pair in users) {
      if (pair.bicwData?.userID != null && pair.zhibeiData == null) {
        var userID = pair.bicwData.userID;
        // A user has a zhibei id, but might be in a different zhibei class.
        pair.zhibeiData = await _findZBUser(userID);
        pair.bicwData.pre_classID = zb_id;
      }
    }
  }
}
