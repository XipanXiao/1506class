import 'package:v2/model/base_entity.dart';
import 'package:v2/model/zb_task_data.dart';

import 'auditable.dart';

class TaskDataPair<T extends TaskData> extends Auditable implements BaseEntity {
  T bicwData;
  T zhibeiData;

  /// The action to be excuted after audtion.
  /// 
  /// Different actions will be performed for different audtion
  /// results. For example, a user will be created or updated
  /// based on whether the user exists in zhibei.info or not.
  String action;

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
    action = null;
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
    if (reportable) {
      action = '上报';
    }
  }

  void moveToFirstReportTerm(Map<int, Map<int, TaskDataPair<T>>> taskData) {}

  @override
  String or<N extends num>(N a, N b) => null;

  @override
  Map<String, String> toMap({BaseEntity remote}) =>
      bicwData.toMap(remote: zhibeiData);

  Iterable<MapEntry<String, dynamic>> toFormData() =>
      bicwData.toFormData(remote: zhibeiData);
}
