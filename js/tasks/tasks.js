define(['services'], function() {
	return angular.module('TasksModule', ['ServicesModule'])
		.controller('TasksController', function($scope, rpc) {
			rpc.get_group_tasks().then(function(response) {
				$scope.tasks = [];
				
				angular.forEach(response.data, function(value) {
					var task = angular.copy(value);
					rpc.get_last_task_record(task.id).then(function(response) {
						task.lastRecord = response.data;
					});
					
					task.lastRecord = null;
					
					$scope.tasks.push(task);
				});
				
				$scope.reportTask = function(task) {
					var task_id = task.id;
					var count = document.getElementById("count_" + task_id).value;
					rpc.report_task(task_id, count)
						.then(function (response) {
						task.lastRecord = {
							sum: response.data.sum, 
							count: count, 
							ts: "Just now"};
					});
				}
			});
		})
		.directive('tasks', function() {
		  return {
		    templateUrl: 'js/tasks/tasks.html'
		  };
		});
});
