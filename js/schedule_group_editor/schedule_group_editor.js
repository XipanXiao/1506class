define(['course_editor/course_editor', 'editable_label/editable_label',
    'services', 'utils'], function() {

  return angular.module('ScheduleGroupEditorModule',
	    ['CourseEditorModule', 'EditableLabelModule', 'ServicesModule',
	     'UtilsModule']).directive('scheduleGroupEditor',
				function(rpc, utils) {
					return {
					  scope: {
					    group: '=',
					    onCancel: '&'
					  },
					  link: function(scope) {
              scope.saveGroup = function(group) {
                group.editing = false;
                
                rpc.update_schedule_group(group);
              };
              scope.courseGroupChanged = function(courses) {
                var group = scope.group;
                group.courses = courses;

                var index = 0;
                var course_ids = utils.keys(courses);
                for (var id in group.schedules) {
                  var schedule = group.schedules[id];
                  if (!parseInt(schedule.course_id)) continue;
                  schedule.course_id = course_ids[index++];
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
