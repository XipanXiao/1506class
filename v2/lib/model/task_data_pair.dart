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
  int get id => bicwData?.id;

  /// Compares bicw and zhibei.info data.
  @override
  void audit({bool compareAtt = false}) {
    if (bicwData == null && zhibeiData == null) return;

    var hasLocalData =
        compareAtt && (bicwData?.att ?? 0) != 0 || bicwData?.isNotEmpty == true;
    var hasRemoteData = compareAtt && (zhibeiData?.att ?? 0) != 0 ||
        zhibeiData?.isNotEmpty == true;
    var sameTotal =
        zhibeiData != null && bicwData?.sameTotal(zhibeiData) == true;

    if (hasLocalData && hasRemoteData) {
      if ((!compareAtt || (bicwData?.att ?? 0) == (zhibeiData?.att ?? 0)) &&
          bicwData == zhibeiData) {
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
