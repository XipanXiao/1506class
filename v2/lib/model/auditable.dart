import 'package:v2/model/reportable.dart';

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

abstract class Auditable extends Reportable {
  /// Whether [bicwData] is consistent with [zhibeiData], or
  /// null if a check is not done yet.
  AuditState audited;

  Auditable();

  Auditable.from(Auditable that) : audited = that.audited;

  @override
  bool get reportable =>
      audited == AuditState.FAIL ||
      audited == AuditState.LOCAL_ONLY ||
      audited == AuditState.PARTIAL_PASS;

  bool get passed => audited == AuditState.PASS;
  bool get failed =>
      audited == AuditState.FAIL || audited == AuditState.LOCAL_ONLY;

  void audit();
}
