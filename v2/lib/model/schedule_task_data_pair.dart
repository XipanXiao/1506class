import 'package:collection/collection.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/schedule_task_data.dart';
import 'package:v2/model/task_data_pair.dart';

import 'auditable.dart';

class ScheduleTaskDataPair extends TaskDataPair<ScheduleTaskData> {
  List<bool> _expand(ScheduleRecord record) =>
      [record?.text ?? false, record?.video ?? false];

  bool limited;
  List<Lesson> lessons;

  @override
  void audit() {
    _auditScheduleRecords(lessons, limited: limited);
  }

  void _auditScheduleRecords(List<Lesson> lessons, {bool limited = false}) {
    if (limited) {
      return _auditAttLimit();
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

  void _auditAttLimit() {
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
}
