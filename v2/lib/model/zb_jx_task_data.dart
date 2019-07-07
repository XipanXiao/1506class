import 'package:v2/model/zb_task_data.dart';

/// Jiaxing data retrieved from zhibei.info.
///
/// Example: {
///   baiziming_count: 15950,
///   baiziming_total: 100000,
///   dingli_count: 0,
///   dingli_total: 100000,
///   dingli_type: "0",
///   faxin_count: 0,
///   faxin_total: 100000,
///   guiyi_count: 0,
///   guiyi_total: 100000,
///   lianshi_count: 0,
///   lianshi_total: 100000,
///   manza_count: 61750
///   manza_total: 100000,
///   manza_type: "0",
///   name: "张三",
///   operation: "0",
///   userID: "123623",
///   user_style: "0",
/// }
class JxTaskData extends TaskData {
  final int baiziming_count;
  int baiziming_total;

  final int dingli_count;
  int dingli_total;
  final int dingli_type;

  final int faxin_count;
  int faxin_total;

  final int guiyi_count;
  int guiyi_total;

  final int lianshi_count;
  int lianshi_total;

  final int manza_count;
  int manza_total;
  final int manza_type;

  JxTaskData.fromJson(Map<String, dynamic> map)
      : baiziming_count = map['baiziming_count'] ?? 0,
        baiziming_total = map['baiziming_total'] ?? 0,
        dingli_count = map['dingli_count'] ?? 0,
        dingli_total = map['dingli_total'] ?? 0,
        dingli_type = int.tryParse(map['dingli_type'] ?? '0'),
        faxin_count = map['faxin_count'] ?? 0,
        faxin_total = map['faxin_total'] ?? 0,
        guiyi_count = map['guiyi_count'] ?? 0,
        guiyi_total = map['guiyi_total'] ?? 0,
        lianshi_count = map['lianshi_count'] ?? 0,
        lianshi_total = map['lianshi_total'] ?? 0,
        manza_count = map['manza_count'] ?? 0,
        manza_total = map['manza_total'] ?? 0,
        manza_type = int.tryParse(map['manza_type'] ?? '0'),
        super.fromJson(map);

  @override
  bool operator ==(that) {
    if (that is! JxTaskData) return false;
    var data = that as JxTaskData;
    return att == data.att &&
        baiziming_count == data.baiziming_count &&
        dingli_count == data.dingli_count &&
        dingli_type == data.dingli_type &&
        faxin_count == data.faxin_count &&
        guiyi_count == data.guiyi_count &&
        lianshi_count == data.lianshi_count &&
        manza_count == data.manza_count &&
        manza_type == data.manza_type;
  }

  @override
  Map<String, String> toMap() {
    var map = <String, String>{
      'baiziming_count': baiziming_count?.toString(),
      'dingli_count': dingli_count?.toString(),
      'dingli_type': dingli_type?.toString(),
      'faxin_count': faxin_count?.toString(),
      'guiyi_count': guiyi_count?.toString(),
      'lianshi_count': lianshi_count?.toString(),
      'manza_count': manza_count?.toString(),
      'manza_type': manza_type?.toString(),
    };
    return map..addAll(super.toMap());
  }

  @override
  bool get isEmpty =>
      super.isEmpty &&
      (baiziming_count == null || baiziming_count == 0) &&
      (dingli_count == null || dingli_count == 0) &&
      (faxin_count == null || faxin_count == 0) &&
      (guiyi_count == null || guiyi_count == 0) &&
      (lianshi_count == null || lianshi_count == 0) &&
      (manza_count == null || manza_count == 0);
}
