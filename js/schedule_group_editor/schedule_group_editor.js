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

                var index = 0;
                var course_ids = utils.keys(courses);
                
                if (group.schedules && utils.keys(group.schedules).length) {
                  // modifying existing schedules.
                  for (var id in group.schedules) {
                    var schedule = group.schedules[id];
                    if (!parseInt(schedule.course_id)) continue;
                    schedule.course_id = course_ids[index++];
                  }
                } else {
                  // creating new schedules.
                  var courseIndex = 0;
                  group.schedules = {};
                  var weeks = Math.max(course_ids.length, 25);  
                  for (index = 0; index < weeks; index++) {
                    var courseId = 0;
                    var holiday = utils.isHolidayWeek(group.start_time, index);
                    if (!holiday) {
                      courseId = course_ids[courseIndex++] || 0; 
                    }

                    group.schedules[index] = {
                      id: 0,
                      course_id: courseId, 
                      group_id: group.id
                    };
                  }
                }
                
                setTimeout(function() {
                  scope.$apply();
                }, 0);
              };
            },
            templateUrl : 'js/schedule_group_editor/schedule_group_editor.html'
          };
        });
});
