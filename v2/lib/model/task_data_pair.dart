import 'package:v2/model/zb_task_data.dart';

import 'auditable.dart';

class TaskDataPair<T extends TaskData> extends Auditable {
  T bicwData;
  T zhibeiData;

  @override
  TaskDataPair clone() => TaskDataPair()
    ..bicwData = bicwData
    ..zhibeiData = zhibeiData
    ..audited = audited;

  String get name => bicwData?.name ?? zhibeiData?.name;

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

  void moveToFirstReportTerm(Map<int, Map<int, TaskDataPair<T>>> taskData) {}
}
