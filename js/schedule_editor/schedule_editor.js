define(['services', 'user_picker/user_picker', 'utils'], function() {
	return angular.module('ScheduleEditorModule',
	    ['ServicesModule', 'UserPickerModule', 'UtilsModule'])
		.directive('scheduleEditor',
				function(rpc, utils) {
					return {
					  scope: {
					    classId: '='
					  },
					  link: function($scope) {
              $scope.$watch('classId', function() {
                if (!$scope.classId) return;

                rpc.get_schedules($scope.classId)
                    .then(function(response) {
                  $scope.schedule_groups = response.data.groups;
                  $scope.users = {};
                  for (var id in response.data.users) {
                    $scope.users[id] = response.data.users[id].name;
                  }
                });
              });
              $scope.update = function(schedule, key, value) {
                schedule[key] = value;
                rpc.update_schedule(schedule);
              };
					  },
						templateUrl : 'js/schedule_editor/schedule_editor.html'
					};
				});
});
