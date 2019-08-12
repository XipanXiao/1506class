import 'package:collection/collection.dart';

import 'auditable.dart';
import 'has_schedule_records.dart';
import 'lesson.dart';

class ScheduleRecordsAuditor {
  static AuditState audit(List<Lesson> lessons, HasScheduleRecords bicwData,
      HasScheduleRecords zhibeiData,
      AbstractScheduleRecord emptyRecord,
      {bool limited}) {
    if (bicwData == null && zhibeiData == null) return null;

    var bicw = bicwData?.records ?? {};
    var zhibei = zhibeiData?.records ?? {};

    var bicwRecords =
        lessons.map((lesson) => bicw[lesson.lesson_id] ?? emptyRecord).toList();
    var zhibeiRecords = lessons
        .map((lesson) => zhibei[lesson.lesson_id] ?? emptyRecord)
        .toList();

    bool isNotEmpty(record) => record.isNotEmpty;
    var hasLocalData =
        limited && (bicwData?.att ?? 0) != 0 || bicwRecords.any(isNotEmpty);
    var hasRemoteData =
        limited && (zhibeiData?.att ?? 0) != 0 || zhibeiRecords.any(isNotEmpty);

    if (hasLocalData && hasRemoteData) {
      if (limited && (bicwData?.att ?? 0) != (zhibeiData?.att ?? 0)) {
        return AuditState.FAIL;
      } else if (ListEquality<AbstractScheduleRecord>()
          .equals(bicwRecords, zhibeiRecords)) {
        return AuditState.PASS;
      } else {
        return AuditState.FAIL;
      }
    } else if (hasLocalData && !hasRemoteData) {
      return AuditState.LOCAL_ONLY;
    } else if (!hasLocalData && hasRemoteData) {
      return AuditState.REMOTE_ONLY;
    } else {
      return AuditState.PASS;
    }
  }
}
