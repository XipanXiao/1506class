import 'package:v2/model/schedule_record.dart';

import 'base_entity.dart';

/// Base structure to encode/decode zhibei.info task data.
abstract class TaskData extends BaseEntity {
  final int operation;
  final int user_style;

  /// zhibei.info user id.
  final int userID;

  /// User name.
  final String name;

  /// Schedule task records, keyed by bicw course id.
  final scheduleRecords = <int, ScheduleRecord>{};

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
}

enum AuditState {
  /// bicw data are consistent with zhibei.info data.
  PASS,

  /// bicw data have same total numbers as zhibei.info data.
  PARTIAL_PASS,

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
      audited == AuditState.FAIL ||
      audited == AuditState.LOCAL_ONLY ||
      audited == AuditState.PARTIAL_PASS;

  bool get passed => audited == AuditState.PASS;
  bool get failed =>
      audited == AuditState.FAIL || audited == AuditState.LOCAL_ONLY;

  /// Compares bicw and zhibei.info data.
  void audit() {
    if (bicwData == null && zhibeiData == null) return;

    var hasLocalData = bicwData?.isNotEmpty == true;
    var hasRemoteData = zhibeiData?.isNotEmpty == true;

    if (hasLocalData && hasRemoteData) {
      if (bicwData == zhibeiData) {
        audited = AuditState.PASS;
      } else if (bicwData.sameTotal(zhibeiData)) {
        audited = AuditState.PARTIAL_PASS;
      } else {
        audited = AuditState.FAIL;
      }
    } else if (hasLocalData && !hasRemoteData) {
      audited = AuditState.LOCAL_ONLY;
    } else if (!hasLocalData && hasRemoteData) {
      audited = AuditState.REMOTE_ONLY;
    } else if (bicwData != null && bicwData.sameTotal(zhibeiData)) {
      audited = AuditState.PASS;
    }
  }
}

typedef T TaskDataFromJson<T>(Map<String, dynamic> json);
