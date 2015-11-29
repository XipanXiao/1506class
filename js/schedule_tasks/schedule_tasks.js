define(['services'], function() {
	return angular.module('ScheduleTasksModule', ['ServicesModule'])
		.controller('ScheduleTasksController', function($scope, rpc) {

			rpc.get_schedules().then(function(response) {
				var schedules = response.data;
				
				rpc.get_courses().then(function(response) {
					var courses = response.data;
					$scope.schedules = [];

					angular.forEach(schedules, function(value) {
						var schedule = angular.copy(value);
						schedule.course_name = schedule.course_id == 0 ? '放假' : courses[schedule.course_id].course_name;
						$scope.schedules.push(schedule);
					});
				});
			});
		})
		.directive('schedules',
				function() {
					return {
						templateUrl : '../js/schedule_tasks/schedule_tasks.html'
					};
				});
});
