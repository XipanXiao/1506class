import 'package:v2/model/report_grid.dart';
import 'package:v2/model/schedule_task_data_pair.dart';
import 'package:v2/services/course_service.dart';
import 'package:v2/services/task_record_service.dart';
import 'package:v2/services/zb_service.dart';

class ScheduleRecordsLoader {
  final CourseService _courseService;
  final TaskRecordService _taskService;
  final ZBService _zbService;

  ScheduleRecordsLoader(
      this._courseService, this._zbService, this._taskService);

  Future<void> load(ReportGrid grid, int halfTerm,
      {bool loadLimitRecords = false}) async {
    // Load all bicw courses.
    if (grid.courses.isEmpty) {
      grid.courses.addAll(await _courseService.getCourses());
    }

    // Load all bicw schedule records for this class.
    if (grid.scheduleRecords.isEmpty) {
      var records = await _taskService.getScheduleRecords(grid.classId);
      grid.scheduleRecords.addAll(records.map(
          (id, user) => MapEntry(id, ScheduleTaskDataPair()..bicwData = user)));
    }

    // Load zhibei [Lesson]s. This will re-map the bicw schedule records,
    // so make sure they are loaded after bicw schedule records are loaded.
    var lessons = grid.getLessons(halfTerm);
    if (lessons == null) {
      var authenticated = await _zbService.ensureAuthenticated();
      if (authenticated) {
        var lessons = await _zbService.getLessons(
            grid.pre_classID, grid.courseID, halfTerm);
        grid.setLessons(halfTerm, lessons);
        var limited = await _zbService.getLessons(
            grid.pre_classID, ReportGrid.limitedCoruseId, halfTerm);
        grid.setLessons(halfTerm, limited, limited: true);
      }
    }

    // Load zhibei schedule records for [halfTerm].
    if (!grid.isScheduleLoaded(halfTerm)) {
      var scheduleRecords = await _zbService.getScheduleRecords(
          grid.pre_classID, halfTerm,
          grid: grid.gridTypes.main_course_grid);
      grid.setZBScheduleRecords(halfTerm, scheduleRecords);
      if (loadLimitRecords) {
        scheduleRecords = await _zbService.getScheduleRecords(
            grid.pre_classID, halfTerm,
            grid: grid.gridTypes.attLimitGrid);
        grid.setZBScheduleRecords(halfTerm, scheduleRecords, limit: true);
      }
    }
  }
}
