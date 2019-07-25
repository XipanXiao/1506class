import 'package:collection/collection.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/zb_task_data.dart';

import 'auditable.dart';

class TaskDataPair<T extends TaskData> extends Auditable {
  T bicwData;
  T zhibeiData;

  TaskDataPair();

  TaskDataPair.from(TaskDataPair that)
      : bicwData = that.bicwData,
        zhibeiData = that.zhibeiData,
        super.from(that);

  String get name => bicwData?.name ?? zhibeiData?.name;

  /// Whether there is a need to report this user's task data to
  /// zhibei.info.
  @override
  bool get reportable =>
      audited == AuditState.FAIL ||
      audited == AuditState.LOCAL_ONLY ||
      audited == AuditState.PARTIAL_PASS;

  /// Compares bicw and zhibei.info data.
  @override
  void audit() {
    if (bicwData == null && zhibeiData == null) return;

    var hasLocalData = bicwData?.isNotEmpty == true;
    var hasRemoteData = zhibeiData?.isNotEmpty == true;
    var sameTotal =
        zhibeiData != null && bicwData?.sameTotal(zhibeiData) == true;

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

  void auditScheduleRecords(List<Lesson> lessons, {bool limited = false}) {
    if (limited) {
      return auditAttLimit();
    }

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

  void auditAttLimit() {
    if (bicwData == null && zhibeiData == null) return;
    if (bicwData == null && zhibeiData != null) {
      audited = AuditState.REMOTE_ONLY;
    } else if (bicwData != null && zhibeiData == null) {
      audited = AuditState.LOCAL_ONLY;
    } else {
      if (bicwData.att == 0 && zhibeiData.att > 0) {
        audited = AuditState.REMOTE_ONLY;
      } else {
        audited =
            bicwData.att == zhibeiData.att ? AuditState.PASS : AuditState.FAIL;
      }
    }
  }

  /// Returns the [ScheduleRecord] for the [Lesson] identified by [lesson_id].
  ScheduleRecord getRecord(int lesson_id, {bool zhibei = false}) {
    var records = (zhibei ? zhibeiData : bicwData)?.scheduleRecords;
    return records == null ? null : records[lesson_id];
  }

  void moveToFirstReportTerm(Map<int, Map<int, TaskDataPair<T>>> taskData) {}
}
