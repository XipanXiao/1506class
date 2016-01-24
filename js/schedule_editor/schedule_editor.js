define(['course_editor/course_editor', 'editable_label/editable_label',
    'schedule_group_editor/schedule_group_editor', 'services',
    'user_picker/user_picker', 'utils'], function() {

  return angular.module('ScheduleEditorModule',
	    ['CourseEditorModule', 'EditableLabelModule', 'ScheduleGroupEditorModule', 
	     'ServicesModule', 'UserPickerModule', 'UtilsModule'])
	     .directive('scheduleEditor', function(rpc, utils) {
					return {
					  scope: {
					    classId: '='
					  },
					  link: function($scope) {
					    $scope.week = 1000*3600*24*7;
					    
					    $scope.getWeeklyTime = function(group, index) {
					      return utils.getWeeklyTime(group.start_time, index);
					    };
					    
              $scope.$watch('classId', function() {
                if (!$scope.classId) return;
                $scope.loadSchedules();
              });
              
              $scope.loadSchedules = function() {
                return rpc.get_schedules($scope.classId)
                    .then(function(response) {
                  $scope.schedule_groups = response.data.groups;
                  $scope.users = {};
                  for (var id in response.data.users) {
                    $scope.users[id] = response.data.users[id].name;
                  }
                  
                  return $scope.schedule_groups;
                });
              };
              
              $scope.update = function(schedule, key, value) {
                schedule[key] = value;
                rpc.update_schedule(schedule);
              };
              $scope.editGroup = function(group) {
                group.editing = true;
              };
					  },
						templateUrl : 'js/schedule_editor/schedule_editor.html'
					};
				});
});
