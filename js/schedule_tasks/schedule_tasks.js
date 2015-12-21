define(['services'], function() {
	return angular.module('ScheduleTasksModule', ['ServicesModule'])
		.controller('ScheduleTasksController', function($scope, rpc) {
			$scope.attendOptions = ['缺席', '出席', '请假'];
			$scope.vacation = function(schedule) {
			  return schedule.course_name == '放假'; 
			};
			
			rpc.get_schedules(true).then(function(response) {
				$scope.schedule_groups = response.data;
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
