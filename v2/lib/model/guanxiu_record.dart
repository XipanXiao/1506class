import 'package:collection/collection.dart';
import 'package:v2/model/base_entity.dart';

import 'package:v2/model/has_schedule_records.dart';
import 'package:v2/model/lesson.dart';

/// Model class for the 'schedule_records' database table.
class GuanxiuRecord extends TaskDataWithLessons {
  /// Map from zhibei [Lesson] id to [GuanxiuData], for
  /// a certain user of a certain half term.
  final Map<int, GuanxiuData> guanxiu;

  GuanxiuRecord.fromJson(Map<String, dynamic> map, Iterable<Lesson> lessons)
      : guanxiu = _parseGuanxiuData(map, lessons),
        super.fromJson(map);

  static Map<int, GuanxiuData> _parseGuanxiuData(
      Map<String, dynamic> map, Iterable<Lesson> lessons) {
    return Map.fromIterable(lessons,
        key: (lesson) => lesson.lesson_id,
        value: (lesson) {
          var id = lesson.lesson_id;
          return GuanxiuData(id, map['count$id'], map['time$id']);
        });
  }

  @override
  Map<int, AbstractScheduleRecord> get records => guanxiu;

  @override
  bool operator ==(that) {
    if (that is! GuanxiuRecord) return false;

    var obj = that as GuanxiuRecord;
    var emptyRecord = GuanxiuData.empty();
    var records = lessons
        .map((lesson) => guanxiu[lesson.lesson_id] ?? emptyRecord)
        .toList();
    var otherRecords = lessons
        .map((lesson) => obj.guanxiu[lesson.lesson_id] ?? emptyRecord)
        .toList();
    return ListEquality().equals(records, otherRecords);
  }

  @override
  bool get isEmpty {
    var records = lessons.map((lesson) => guanxiu[lesson.lesson_id]);
    return records.every((record) => record == null || record.isEmpty);
  }

  @override
  bool get isNotEmpty {
    var records = lessons.map((lesson) => guanxiu[lesson.lesson_id]);
    return records.any((record) => record != null && record.isNotEmpty);
  }

  /// Returns a [List] of [MapEntry]'s that will be post
  /// to zhibei.info for reporting purpose.
  ///   userID: 123623
  ///   pre_classID: 7685
  ///   type: guanxiu_grid
  ///   half_term: 13
  ///   count[]: 4
  ///   count[]: 4
  ///   count[]: 4
  ///   count[]: 4
  ///   count[]: 6
  ///   count[]: 5
  ///   count[]: 6
  ///   count[]: 5
  ///   count[]: 5
  ///   time[]: 2.5
  ///   time[]: 2
  ///   time[]: 2
  ///   time[]: 2
  ///   time[]: 3
  ///   time[]: 2.5
  ///   time[]: 3
  ///   time[]: 2.5
  ///   time[]: 2.5
  @override
  List<MapEntry<String, dynamic>> toFormData({BaseEntity remote}) {
    return <String, dynamic>{}.entries.toList()
      ..addAll(toMap(remote: remote).entries)
      ..addAll(_getCountRecords(remote))
      ..addAll(_getTimeRecords(remote));
  }

  static T _or<T>(T a, T b) => (a ?? 0) == 0 ? (b ?? 0) : (a ?? 0);

  int _countOr(GuanxiuRecord remote, int lesson_id) {
    return _or(guanxiu[lesson_id]?.count,
        remote == null ? null : remote.guanxiu[lesson_id]?.count);
  }

  double _timeOr(GuanxiuRecord remote, int lesson_id) {
    return _or(guanxiu[lesson_id]?.time,
        remote == null ? null : remote.guanxiu[lesson_id]?.time);
  }

  Iterable<MapEntry<String, int>> _getCountRecords(
          TaskDataWithLessons remote) =>
      lessons.map(
          (lesson) => MapEntry('count[]', _countOr(remote, lesson.lesson_id)));

  Iterable<MapEntry<String, double>> _getTimeRecords(
          TaskDataWithLessons remote) =>
      lessons.map(
          (lesson) => MapEntry('time[]', _timeOr(remote, lesson.lesson_id)));
}

class GuanxiuData implements AbstractScheduleRecord {
  final int student_id;
  final int lesson_id;
  final int count;
  final double time;
  GuanxiuData(this.lesson_id, this.count, this.time, {this.student_id});

  GuanxiuData.empty({this.lesson_id, this.count, this.time, this.student_id});

  GuanxiuData.fromJson(Map<String, dynamic> map)
      : count = int.parse(map['count']),
        time = map['duration'],
        student_id = int.parse(map['student_id']),
        lesson_id = int.parse(map['sub_index']) + 1;

  bool get isEmpty => (count ?? 0) == 0 && (time ?? 0.0) == 0.0;

  @override
  bool get isNotEmpty => !isEmpty;

  @override
  int get hashCode => count * 1000 + time.round();

  @override
  bool operator ==(that) {
    if (that is! GuanxiuData) return false;
    return (count ?? 0) == (that.count ?? 0) && (time ?? 0) == (that.time ?? 0);
  }
}
