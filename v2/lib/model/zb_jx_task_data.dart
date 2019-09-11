import 'package:v2/model/base_entity.dart';
import 'package:v2/model/class_task_data.dart';
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
  int baiziming_count;
  int baiziming_total;

  int dingli_count;
  int dingli_total;
  final String dingli_type;

  int faxin_count;
  int faxin_total;

  int guiyi_count;
  int guiyi_total;

  int lianshi_count;
  int lianshi_total;

  int manza_count;
  int manza_total;
  final String manza_type;

  JxTaskData.fromJson(Map<String, dynamic> map)
      : baiziming_count = map['baiziming_count'],
        baiziming_total = map['baiziming_total'],
        dingli_count = map['dingli_count'],
        dingli_total = map['dingli_total'],
        dingli_type = map['dingli_type'],
        faxin_count = map['faxin_count'],
        faxin_total = map['faxin_total'],
        guiyi_count = map['guiyi_count'],
        guiyi_total = map['guiyi_total'],
        lianshi_count = map['lianshi_count'],
        lianshi_total = map['lianshi_total'],
        manza_count = map['manza_count'],
        manza_total = map['manza_total'],
        manza_type = map['manza_type'],
        super.fromJson(map);

  @override
  bool operator ==(that) {
    if (that is! JxTaskData) return false;
    var data = that as JxTaskData;
    return (baiziming_count ?? 0) == (data.baiziming_count ?? 0) &&
        (dingli_count ?? 0) == (data.dingli_count ?? 0) &&
        (dingli_type ?? '0') == (data.dingli_type ?? '0') &&
        (faxin_count ?? 0) == (data.faxin_count ?? 0) &&
        (guiyi_count ?? 0) == (data.guiyi_count ?? 0) &&
        (lianshi_count ?? 0) == (data.lianshi_count ?? 0) &&
        (manza_count ?? 0) == (data.manza_count ?? 0) &&
        (manza_type ?? '0') == (data.manza_type ?? '0');
  }

  @override
  Map<String, String> toMap({BaseEntity remote}) {
    var that = remote as JxTaskData;
    var map = <String, String>{
      'baiziming_count': or(baiziming_count, that?.baiziming_count),
      'dingli_count': or(dingli_count, that?.dingli_count),
      'dingli_type': dingli_type ?? that?.dingli_type ?? '0',
      'faxin_count': or(faxin_count, that?.faxin_count),
      'guiyi_count': or(guiyi_count, that?.guiyi_count),
      'lianshi_count': or(lianshi_count, that?.lianshi_count),
      'manza_count': or(manza_count, that?.manza_count),
      'manza_type': manza_type ?? that?.manza_type ?? '0',
    };
    return map..addAll(super.toMap(remote: remote));
  }

  JxTaskData _cloneUser() => JxTaskData.fromJson({
        'id': id,
        'userID': userID?.toString(),
        'name': name,
      });

  @override
  bool get isEmpty =>
      (baiziming_count == null || baiziming_count == 0) &&
      (dingli_count == null || dingli_count == 0) &&
      (faxin_count == null || faxin_count == 0) &&
      (guiyi_count == null || guiyi_count == 0) &&
      (lianshi_count == null || lianshi_count == 0) &&
      (manza_count == null || manza_count == 0);

  @override
  bool get isNotEmpty => !isEmpty;

  @override
  void initTotal() {
    baiziming_total ??= 0;
    dingli_total ??= 0;
    faxin_total ??= 0;
    guiyi_total ??= 0;
    lianshi_total ??= 0;
    manza_total ??= 0;
  }

  bool _checkTotal(int a, int b) => a == null || b == null || a == b;

  @override
  bool sameTotal(TaskData that) {
    var data = that as JxTaskData;
    return _checkTotal(baiziming_total, data.baiziming_total) &&
        _checkTotal(dingli_total, data.dingli_total) &&
        _checkTotal(faxin_total, data.faxin_total) &&
        _checkTotal(guiyi_total, data.guiyi_total) &&
        _checkTotal(lianshi_total, data.lianshi_total) &&
        _checkTotal(manza_total, data.manza_total);
  }

  @override
  void moveToFirstReportableTerm(Map<int, ClassTaskData> data, int fromTerm) {
    var taskData = data as Map<int, ClassTaskData<JxTaskData>>;
    if (baiziming_count != null && baiziming_count > 0) {
      for (var term in taskData.keys) {
        var user = taskData[term].users[id];
        if (user == null || user.zhibeiData?.baiziming_total == null) {
          continue;
        }
        // The first reportable term is earlier than [fromTerm],
        // nothing needed.
        if (term <= fromTerm) break;
        user.bicwData ??= _cloneUser();
        user.bicwData.baiziming_count =
            (user.bicwData.baiziming_count ?? 0) + baiziming_count;
        baiziming_count = 0;
        break;
      }
    }
    if (dingli_count != null && dingli_count > 0) {
      for (var term in taskData.keys) {
        var user = taskData[term].users[id];
        if (user == null || user.zhibeiData?.dingli_total == null) {
          continue;
        }
        // The first reportable term is earlier than [fromTerm],
        // nothing needed.
        if (term <= fromTerm) break;
        user.bicwData ??= _cloneUser();
        user.bicwData.dingli_count =
            (user.bicwData.dingli_count ?? 0) + dingli_count;
        dingli_count = 0;
        break;
      }
    }
    if (faxin_count != null && faxin_count > 0) {
      for (var term in taskData.keys) {
        var user = taskData[term].users[id];
        if (user == null || user.zhibeiData?.faxin_total == null) {
          continue;
        }
        // The first reportable term is earlier than [fromTerm],
        // nothing needed.
        if (term <= fromTerm) break;
        user.bicwData ??= _cloneUser();
        user.bicwData.faxin_count =
            (user.bicwData.faxin_count ?? 0) + faxin_count;
        faxin_count = 0;
        break;
      }
    }
    if (guiyi_count != null && guiyi_count > 0) {
      for (var term in taskData.keys) {
        var user = taskData[term].users[id];
        if (user == null || user.zhibeiData?.guiyi_total == null) {
          continue;
        }
        // The first reportable term is earlier than [fromTerm],
        // nothing needed.
        if (term <= fromTerm) break;
        user.bicwData ??= _cloneUser();
        user.bicwData.guiyi_count =
            (user.bicwData.guiyi_count ?? 0) + guiyi_count;
        guiyi_count = 0;
        break;
      }
    }
    if (lianshi_count != null && lianshi_count > 0) {
      for (var term in taskData.keys) {
        var user = taskData[term].users[id];
        if (user == null || user.zhibeiData?.lianshi_total == null) {
          continue;
        }
        // The first reportable term is earlier than [fromTerm],
        // nothing needed.
        if (term <= fromTerm) break;
        user.bicwData ??= _cloneUser();
        user.bicwData.lianshi_count =
            (user.bicwData.lianshi_count ?? 0) + lianshi_count;
        lianshi_count = 0;
        break;
      }
    }
    if (manza_count != null && manza_count > 0) {
      for (var term in taskData.keys) {
        var user = taskData[term].users[id];
        if (user == null || user.zhibeiData?.manza_total == null) {
          continue;
        }
        // The first reportable term is earlier than [fromTerm],
        // nothing needed.
        if (term <= fromTerm) break;
        user.bicwData ??= _cloneUser();
        user.bicwData.manza_count =
            (user.bicwData.manza_count ?? 0) + manza_count;
        manza_count = 0;
        break;
      }
    }
  }
}
