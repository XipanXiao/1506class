define(['services'], function() {
	return angular.module('ScheduleTasksModule', ['ServicesModule'])
		.controller('ScheduleTasksController', function($scope, rpc) {

			rpc.get_schedules(true).then(function(response) {
				$scope.schedules = response.data;
			});
			
			$scope.reportTask = function (schedule) {
				rpc.report_schedule_task(schedule);
			};
		})
		.directive('scheduleTasks',
				function() {
					return {
						templateUrl : 'js/schedule_tasks/schedule_tasks.html'
					};
				});
});
