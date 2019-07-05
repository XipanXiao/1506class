import 'base_entity.dart';

class Lesson {
  final int lesson_id;
  final String name;

  Lesson(this.lesson_id, this.name);
}

class ReportGrid {
  /// zhibei.info Lesson ID.
  final int courseID;

  /// zhibei.info report grid type.
  final String grid_type;

  /// zhibei.info main course lessons list.
  final lessons = <Lesson>[];

  /// zhibei.info class id.
  int pre_classID;

  /// A map from zhibei id to bicw id.
  final userIdMap = <int, int>{};

  /// Bicw and zhibei.info task data.
  ///
  /// It is a map of maps (from user id to her task
  /// data of a certain half_term). Then the outer map has
  /// all half_terms. Like
  ///
  /// half_term 0, 1, 3 has a null map.
  /// half_term 2 has a map like
  /// {
  ///   user_id1: user1 task data of the first term,
  ///   user_id2: user2 task data of the first term,
  ///   user_id3: user3 task data of the first term,
  /// }
  /// ...
  final taskData = <int, Map<int, TaskDataPair>>{};

  ReportGrid(this.courseID, this.grid_type);

  String lessonQuery(int half_term) => 'courseID=$courseID&half_term=$half_term'
      '&type=pre_class_lessons&pre_classID=$pre_classID';

  String taskDataQuery(int half_term) =>
      'type=$grid_type&pre_classID=$pre_classID&half_term=$half_term';

  /// Adds loaded task data to this grid.
  void setTaskData(Map<int, Map<int, TaskData>> data, {bool zhibei = false}) {
    for (var halfTerm in data.keys) {
      var dest = taskData.putIfAbsent(halfTerm, () => <int, TaskDataPair>{});
      for (var user in data[halfTerm].values) {
        var id = zhibei ? userIdMap[user.userID] : user.id;
        var destUser = dest.putIfAbsent(id, () => TaskDataPair());
        if (zhibei) {
          destUser.zhibeiData = user;
          _audit(destUser);
        } else {
          destUser.bicwData = user;
        }
      }
    }
  }

  /// Check whether task data of [half_term] are fully loaded.
  bool isLoaded(half_term) {
    var halfTermData = taskData[half_term];
    if (halfTermData == null) return false;
    return halfTermData.values.any((user) => user.zhibeiData != null);
  }

  /// Clears zhibei.info cache for [halfTerm].
  void clearCache(int halfTerm) {
    var halfTermData = taskData[halfTerm];
    if (halfTermData == null) return;
    for (var user in halfTermData.values) {
      user.zhibeiData = null;
    }
  }

  /// Compares bicw and zhibei.info data.
  void _audit(TaskDataPair user) {
    if ((user.bicwData == null) != (user.zhibeiData == null)) {
      user.audited = false;
    } else if (user.bicwData != null) {
      user.audited = user.bicwData == user.zhibeiData;
    }
  }
}

class TaskData extends BaseEntity {
  /// bicw user id.
  int id;

  /// zhibei.info user id.
  final int userID;

  /// User name.
  final String name;

  /// Times of attendence of this user for
  /// a specific half term.
  int att = 0;

  TaskData({this.id, this.userID, this.name, this.att});

  TaskData.fromJson(Map<String, dynamic> map)
      : id = map['id'],
        userID = int.tryParse(map['userID'] ?? ''),
        name = map['name'],
        att = map['att'] ?? 0;

  @override
  int get hashCode => id.hashCode;

  @override
  Map<String, String> toMap() {
    return {
      'userID': userID.toString(),
      'att': att?.toString(),
    };
  }
}

class TaskDataPair {
  /// Whether [bicwData] is identical to [zhibeiData], or
  /// null if a check is not done yet.
  bool audited;

  TaskData bicwData;
  TaskData zhibeiData;

  TaskDataPair();

  TaskDataPair.from(TaskDataPair that)
      : audited = that.audited,
        bicwData = that.bicwData,
        zhibeiData = that.zhibeiData;
}

typedef T TaskDataFromJson<T>(Map<String, dynamic> json);

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
