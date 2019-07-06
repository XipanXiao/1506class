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

  /// Whether there is any meaningful data.
  bool get isEmpty => att == null || att == 0;
  bool get isNotEmpty => !isEmpty;
}

enum AuditState {
  /// bicw data are consistent with zhibei.info data.
  PASS,

  /// bicw data are not consistent with zhibei.info data.
  FAIL,

  /// bicw data are present but zhibei.info are not.
  LOCAL_ONLY,

  /// zhibei.info data are present but bicw data are not.
  REMOTE_ONLY,
}

class TaskDataPair<T extends TaskData> {
  /// Whether [bicwData] is consistent with [zhibeiData], or
  /// null if a check is not done yet.
  AuditState audited;

  T bicwData;
  T zhibeiData;

  TaskDataPair();

  TaskDataPair.from(TaskDataPair that)
      : audited = that.audited,
        bicwData = that.bicwData,
        zhibeiData = that.zhibeiData;

  /// Whether there is a need to report this user's task data to
  /// zhibei.info.
  bool get reportable =>
      audited == AuditState.FAIL || audited == AuditState.LOCAL_ONLY;

  bool get passed => audited == AuditState.PASS;

  /// Compares bicw and zhibei.info data.
  void audit() {
    if (bicwData == null && zhibeiData == null) return;

    var hasLocalData = bicwData?.isNotEmpty == true;
    var hasRemoteData = zhibeiData?.isNotEmpty == true;

    if (hasLocalData && hasRemoteData) {
      audited = bicwData == zhibeiData ? AuditState.PASS : AuditState.FAIL;
    } else if (hasLocalData && !hasRemoteData) {
      audited = AuditState.LOCAL_ONLY;
    } else {
      audited = AuditState.REMOTE_ONLY;
    }
  }
}

typedef T TaskDataFromJson<T>(Map<String, dynamic> json);