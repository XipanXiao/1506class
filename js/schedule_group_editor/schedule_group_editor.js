define(['course_editor/course_editor', 'editable_label/editable_label',
    'services', 'utils'], function() {

  return angular.module('ScheduleGroupEditorModule',
	    ['CourseEditorModule', 'EditableLabelModule', 'ServicesModule',
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
                    onSave();
                  }
                });
              };
              scope.courseGroupChanged = function(courses) {
                var group = scope.group;
                group.courses = courses;

                var index = 0;
                var course_ids = utils.keys(courses);
                
                if (group.schedules) {
                  // modifying existing schedules.
                  for (var id in group.schedules) {
                    var schedule = group.schedules[id];
                    if (!parseInt(schedule.course_id)) continue;
                    schedule.course_id = course_ids[index++];
                  }
                } else {
                  // creating new schedules.
                  group.schedules = {};
                  for (var id in courses) {
                    group.schedules[index] = {
                      id: 0,
                      course_id: course_ids[index],
                      group_id: group.id
                    };
                    
                    index++;
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
