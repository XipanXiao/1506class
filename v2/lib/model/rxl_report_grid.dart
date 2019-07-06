
import 'package:v2/model/report_grid.dart';

class RxlTaskData extends TaskData {
  final int operation;
  final int select_all;

  final int user_style;

  int gx_count;
  double gx_time;
  int mantra_count;
  int mantra_total;

  RxlTaskData({
    int id,
    int userID,
    String name,
    int att,
    this.gx_count,
    this.gx_time,
    this.mantra_count,
    this.mantra_total,
    this.operation,
    this.select_all,
    this.user_style,
  }) : super(id: id, userID: userID, name: name, att: att);

  RxlTaskData.fromJson(Map<String, dynamic> map)
      : gx_count = map['gx_count'] ?? 0,
        gx_time = map['gx_time'] ?? 0,
        mantra_count = map['mantra_count'] ?? 0,
        mantra_total = map['mantra_total'] ?? 0,
        operation = int.tryParse(map['operation'] ?? ''),
        select_all = int.tryParse(map['select_all'] ?? ''),
        user_style = int.tryParse(map['user_style'] ?? ''),
        super.fromJson(map);

  @override
  bool operator ==(that) {
    if (that is! RxlTaskData) return false;
    var data = that as RxlTaskData;
    return att == data.att &&
        gx_count == data.gx_count &&
        gx_time == data.gx_time &&
        mantra_count == data.mantra_count;
  }

  @override
  Map<String, String> toMap() {
    var map = <String, String>{
      'gx_count': gx_count?.toString(),
      'gx_time': gx_time?.toString(),
      'mantra_count': mantra_count?.toString(),
    };
    return map..addAll(super.toMap());
  }
}

class RxlTaskGrid extends ReportGrid {
  RxlTaskGrid() : super(2, 'rxl_work_grid');

  /// Adds loaded task data to this grid.
  ///
  /// Note since `mantra_total` is not returned by the bicw server,
  /// the values are calculated before storing the data.
  @override
  void setTaskData(Map<int, Map<int, TaskData>> data, {bool zhibei = false}) {
    if (data.isEmpty) return;

    if (zhibei) {
      return super.setTaskData(data, zhibei: true);
    }

    var rxlData = data as Map<int, Map<int, RxlTaskData>>;

    var lastTerm = rxlData.values.last;
    for (var halfTerm in rxlData.values) {
      for (var user in halfTerm.values) {
        userIdMap[user.userID] = user.id;
        lastTerm[user.id].mantra_total += user.mantra_count;
      }
    }
    for (var halfTerm in rxlData.values) {
      for (var user in halfTerm.values) {
        user.mantra_total = lastTerm[user.id].mantra_total;
      }
    }
    super.setTaskData(data);
  }
}

class RxlTaskDataPair extends TaskDataPair {
  @override
  RxlTaskData get bicwData => super.bicwData as RxlTaskData;

  @override
  RxlTaskData get zhibeiData => super.zhibeiData as RxlTaskData;

  RxlTaskDataPair(TaskDataPair pair) : super.from(pair);
}
