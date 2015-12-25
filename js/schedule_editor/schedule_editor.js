define(['services', 'user_picker/user_picker'], function() {
	return angular.module('ScheduleEditorModule',
	    ['ServicesModule', 'UserPickerModule'])
		.controller('ScheduleEditorController', function($scope, rpc) {
		  $scope.$on('class-selected', function(event, classInfo) {
			  $scope.classId = classInfo.id;
	      rpc.get_schedules(false, classInfo.id).then(function(response) {
	        $scope.schedule_groups = response.data.groups;
	        $scope.users = response.data.users;
	      });
      });
			
      $scope.update = function(schedule) {
        rpc.update_schedule(schedule);
      };
		})
		.directive('scheduleEditor',
				function() {
					return {
						templateUrl : 'js/schedule_editor/schedule_editor.html'
					};
				});
});
