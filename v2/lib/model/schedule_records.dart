import 'package:collection/collection.dart';
import 'package:v2/model/auditable.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/zb_task_data.dart';

/// All schedule records of all terms for a single user.
class ScheduleRecords extends TaskData with Auditable {
  /// Map from zhibei Lesson ID to [ScheduleRecord]s.
  final _bicwData = <int, ScheduleRecord>{};
  final _zhibeiData = <int, ScheduleRecord>{};

  /// Map from bicw course ID to [ScheduleRecord]s.
  final _rawBicwData = <int, ScheduleRecord>{};

  Iterable<int> _lessonIds;

  ScheduleRecords.fromJson(Map<String, dynamic> map) : super.fromJson(map);

  void addRecord(ScheduleRecord record, {bool zhibei = false}) {
    var map = zhibei ? _zhibeiData : _rawBicwData;
    map[record.course_id] = record;
  }

  Map<int, ScheduleRecord> get bicwData => _bicwData;

  void convertCourseIds(Map<int, int> courseIdMap) {
    for (var courseId in courseIdMap.keys) {
      var record = _rawBicwData[courseId];
      if (record != null) {
        _bicwData[courseIdMap[courseId]] = record;
      }
    }
  }

  void setLessons(Iterable<int> lessonIds) {
    _lessonIds = lessonIds;
  }

  ScheduleRecord getRecord(int lessonId, {bool zhibei = false}) =>
      (zhibei ? _zhibeiData : _bicwData)[lessonId];

  List<bool> _expand(ScheduleRecord record) =>
      [record?.text ?? false, record?.video ?? false];

  @override
  void audit() {
    audited = null;
    if (_lessonIds == null || _bicwData == null && _zhibeiData == null) return;

    var bicwRecords =
        _lessonIds.expand((lesson) => _expand(_bicwData[lesson])).toList();
    var zhibeiRecords =
        _lessonIds.expand((lesson) => _expand(_zhibeiData[lesson])).toList();

    bool isTrue(bool value) => value;
    var hasLocalData = bicwRecords.any(isTrue);
    var hasRemoteData = zhibeiRecords.any(isTrue);

    if (hasLocalData && hasRemoteData) {
      if (ListEquality<bool>().equals(bicwRecords, zhibeiRecords)) {
        audited = AuditState.PASS;
      } else {
        audited = AuditState.FAIL;
      }
    } else if (hasLocalData && !hasRemoteData) {
      audited = AuditState.LOCAL_ONLY;
    } else if (!hasLocalData && hasRemoteData) {
      audited = AuditState.REMOTE_ONLY;
    } else {
      audited = AuditState.PASS;
    }
  }
}
