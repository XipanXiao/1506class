import 'package:collection/collection.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/zb_task_data.dart';

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

  String get name => bicwData?.name ?? zhibeiData?.name;

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
    var sameTotal = bicwData?.sameTotal(zhibeiData) == true;

    if (hasLocalData && hasRemoteData) {
      if (bicwData == zhibeiData) {
        audited = AuditState.PASS;
      } else if (sameTotal) {
        audited = AuditState.PARTIAL_PASS;
      } else {
        audited = AuditState.FAIL;
      }
    } else if (hasLocalData && !hasRemoteData) {
      audited = sameTotal ? AuditState.PARTIAL_PASS : AuditState.LOCAL_ONLY;
    } else if (!hasLocalData && hasRemoteData) {
      audited = AuditState.REMOTE_ONLY;
    } else if (bicwData != null && sameTotal) {
      audited = AuditState.PASS;
    }
  }

  List<bool> _expand(ScheduleRecord record) =>
      [record?.text ?? false, record?.video ?? false];

  void auditScheduleRecords(List<Lesson> lessons) {
    audited = null;
    if (bicwData == null && zhibeiData == null) return;

    var bicw = bicwData?.scheduleRecords ?? {};
    var zhibei = zhibeiData?.scheduleRecords ?? {};

    var bicwRecords =
        lessons.expand((lesson) => _expand(bicw[lesson.lesson_id])).toList();
    var zhibeiRecords =
        lessons.expand((lesson) => _expand(zhibei[lesson.lesson_id])).toList();

    bool isTrue(bool value) => value;
    var hasLocalData = bicwRecords.any(isTrue);
    var hasRemoteData = zhibeiRecords.any(isTrue);

    if (hasLocalData && hasRemoteData) {
      if (ListEquality<bool>().equals(bicwRecords, zhibeiRecords)) {
        audited = AuditState.PASS;
      } else {
        audited = AuditState.FAIL;
      }
    } else if (hasLocalData && !hasRemoteData) {
      audited = AuditState.LOCAL_ONLY;
    } else if (!hasLocalData && hasRemoteData) {
      audited = AuditState.REMOTE_ONLY;
    } else {
      audited = AuditState.PASS;
    }
  }
}
