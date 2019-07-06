import 'base_entity.dart';

/// Base structure to encode/decode zhibei.info task data.
class TaskData extends BaseEntity {
  /// bicw user id.
  int id;

  /// zhibei.info user id.
  final int userID;

  /// User name.
  final String name;

  /// Times of attendence of this user for
  /// a specific half term.
  int att = 0;

  TaskData({this.id, this.userID, this.name, this.att});

  TaskData.fromJson(Map<String, dynamic> map)
      : id = map['id'],
        userID = int.tryParse(map['userID'] ?? ''),
        name = map['name'],
        att = map['att'] ?? 0;

  @override
  int get hashCode => id.hashCode;

  @override
  Map<String, String> toMap() {
    return {
      'userID': userID.toString(),
      'att': att?.toString(),
    };
  }
}

class TaskDataPair {
  /// Whether [bicwData] is identical to [zhibeiData], or
  /// null if a check is not done yet.
  bool audited;

  TaskData bicwData;
  TaskData zhibeiData;

  TaskDataPair();

  TaskDataPair.from(TaskDataPair that)
      : audited = that.audited,
        bicwData = that.bicwData,
        zhibeiData = that.zhibeiData;

  /// Compares bicw and zhibei.info data.
  void audit() {
    if ((bicwData == null) != (zhibeiData == null)) {
      audited = false;
    } else if (bicwData != null) {
      audited = bicwData == zhibeiData;
    }
  }
}

typedef T TaskDataFromJson<T>(Map<String, dynamic> json);
