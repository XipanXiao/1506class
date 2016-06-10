define('schedule_group_editor/schedule_group_editor',
    ['course_groups/course_groups', 'editable_label/editable_label',
    'services', 'utils'], function() {

  return angular.module('ScheduleGroupEditorModule',
      ['CourseGroupsModule', 'EditableLabelModule', 'ServicesModule',
       'UtilsModule']).directive('scheduleGroupEditor',
        function(rpc, utils) {
          return {
            scope: {
              group: '=',
              onCancel: '&',
              onSave: '&'
            },
            link: function(scope) {
              scope.saveGroup = function(group) {
                rpc.update_schedule_group(group).then(function(response) {
                  if (parseInt(response.data.updated)) {
                    group.editing = false;
                    scope.onSave();
                  }
                });
              };
              scope.courseGroupChanged = function(courses) {
                var group = scope.group;
                group.courses = courses;

                var week = 0;
                var courseIndex = 0;
                var schedule_id = 0;
                var course_ids = utils.keys(courses);
                var weeks = Math.max(course_ids.length, 25);  
                
                if (group.schedules && utils.keys(group.schedules).length) {
                  // Modifying existing schedules.
                  for (var id in group.schedules) {
                    week++;
                    var schedule = group.schedules[id];
                    if (!parseInt(schedule.course_id)) continue;
                    schedule.course_id = course_ids[courseIndex++];
                  }
                  schedule_id = utils.maxKey(group.schedules) + 1;
                } else {
                  group.schedules = {};
                }

                // Appending new schedules.
                for (; week < weeks; week++) {
                  var courseId = 0;
                  var holiday = utils.isHolidayWeek(group.start_time, week);
                  if (holiday) {
                    // Don't append a holiday at the end.
                    if (week == weeks - 1) break;
                  } else {
                    courseId = course_ids[courseIndex++];
                    if (!courseId) break;
                  }

                  group.schedules[schedule_id] = {
                    id: 0,
                    course_id: courseId, 
                    group_id: group.id
                  };
                  schedule_id++;
                }
                
                setTimeout(function() {
                  scope.$apply();
                }, 0);
              };
              scope.terms = (function() {
                var terms = [];
                for (var index = 1;index <= utils.totalTerms; index++)
                  terms.push(index);
                return terms;
              })();
            },
            templateUrl : 'js/schedule_group_editor/schedule_group_editor.html'
          };
        });
});
