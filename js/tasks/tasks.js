angular.module('TasksModule', [])
.controller('TasksController', function($scope, $http, $httpParamSerializerJQLike) {
	get_group_tasks($http).then(function(response) {
		$scope.tasks = [];
		
		angular.forEach(response.data, function(value) {
			var task = angular.copy(value);
			get_last_task_record($http, task.id).then(function(response) {
				task.lastRecord = response.data;
			});
			
			task.lastRecord = null;
			
			$scope.tasks.push(task);
		});
		
		$scope.reportTask = function(task) {
			var task_id = task.id;
			var count = document.getElementById("count_" + task_id).value;
			report_task($http, $httpParamSerializerJQLike, task_id, count)
				.then(function (response) {
				task.lastRecord = {
					total: response.data.total, 
					count: count, 
					ts: "Just now"};
			});
		}
	});
})
.directive('tasks', function() {
  return {
    templateUrl: '../js/tasks/tasks.html'
  };
});
