import 'package:collection/collection.dart';

import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/zb_task_data.dart';

import 'has_schedule_records.dart';

/// Base structure to encode/decode zhibei.info task data.
class ScheduleTaskData extends TaskDataWithLessons {
  /// Schedule task records, keyed by zhibei [Lesson] IDs.
  final scheduleRecords = <int, ScheduleRecord>{};

  /// Schedule task records, keyed by bicw [Course] IDs.
  final _scheduleRecords = <int, ScheduleRecord>{};

  ScheduleTaskData.fromJson(Map<String, dynamic> map) : super.fromJson(map);

  @override
  TaskData clone() {
    return ScheduleTaskData.fromJson(
        {'id': id, 'userID': '$userID', 'name': name, 'att': att});
  }

  /// Stores the bicw schedule [record] at the [_scheuleRecords]
  /// map.
  void addBicwScheduleRecord(ScheduleRecord record) {
    _scheduleRecords[record.course_id] = record;
  }

  /// Rebuilds the map of bicw schedule records, to use
  /// zhibei [Lesson] ID's as keys, instead of bicw [Course]
  /// ID's, using the [courseIdMap].
  void buildScheduleRecords(Map<int, int> courseIdMap) {
    for (var courseId in courseIdMap.keys) {
      var record = _scheduleRecords[courseId];
      if (record != null) {
        scheduleRecords[courseIdMap[courseId]] = record;
      }
    }
  }

  @override
  Map<int, AbstractScheduleRecord> get records => scheduleRecords;

  @override
  bool operator ==(that) {
    if (that is! ScheduleTaskData) return false;
    var obj = that as ScheduleTaskData;
    var emptyRecord = ScheduleRecord.fromJson({});
    var records = lessons
        .map((lesson) => scheduleRecords[lesson.lesson_id] ?? emptyRecord)
        .toList();
    var otherRecords = lessons
        .map((lesson) => obj.scheduleRecords[lesson.lesson_id] ?? emptyRecord)
        .toList();
    return ListEquality().equals(records, otherRecords);
  }

  @override
  bool get isEmpty {
    var records = lessons.map((lesson) => scheduleRecords[lesson.lesson_id]);
    return records.every((record) => record == null || record.isEmpty);
  }

  @override
  bool get isNotEmpty => !isEmpty;

  /// Returns a [List] of [MapEntry]'s that will be post
  /// to zhibei.info for reporting purpose.
  ///   userID: 123623
  ///   pre_classID: 7685
  ///   type: 'jx_grid'
  ///   half_term: 13
  ///   book[]: 1
  ///   book[]: 1
  ///   book[]: 0
  ///   book[]: 0
  ///   book[]: 0
  ///   book[]: 1
  ///   book[]: 1
  ///   book[]: 1
  ///   book[]: 1
  ///   audio[]: 0
  ///   audio[]: 0
  ///   audio[]: 0
  ///   audio[]: 0
  ///   audio[]: 1
  ///   audio[]: 0
  ///   audio[]: 1
  ///   audio[]: 0
  ///   audio[]: 1
  @override
  List<MapEntry<String, dynamic>> toFormData() {
    return <String, dynamic>{}.entries.toList()
      ..addAll(toMap().entries)
      ..addAll(_getBookRecords())
      ..addAll(_getAudioRecords());
  }

  Iterable<MapEntry<String, int>> _getBookRecords() =>
      lessons.map((lesson) => MapEntry(
          'book[]', scheduleRecords[lesson.lesson_id]?.text == true ? 1 : 0));

  Iterable<MapEntry<String, int>> _getAudioRecords() =>
      lessons.map((lesson) => MapEntry(
          'audio[]', scheduleRecords[lesson.lesson_id]?.video == true ? 1 : 0));
}
