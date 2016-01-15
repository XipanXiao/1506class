define(['progress_bar/progress_bar', 'services'], function() {
  return angular.module('TasksModule', ['ProgressBarModule', 'ServicesModule'])
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
          var count =
              parseInt(document.getElementById("count_" + task_id).value);
          var sum = parseInt(task.lastRecord && task.lastRecord.sum || 0) +
              count;
          rpc.report_task(task_id, count, sum).then(function (response) {
            task.lastRecord = response.data;
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
