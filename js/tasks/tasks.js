define('tasks/tasks',
    ['progress_bar/progress_bar', 'services', 'utils'], function() {
  return angular.module('TasksModule', ['ProgressBarModule', 'ServicesModule',
      'UtilsModule']).directive('tasks', function(rpc, utils) {
      return {
        scope: {
          departmentId: '@'
        },
        link: function($scope) {
          $scope.$watch('departmentId', function() {
            if (!$scope.departmentId) return;

            rpc.get_tasks($scope.departmentId).then(function(response) {
              $scope.isNotEmpty = !utils.isEmpty(response.data);
              $scope.tasks = [];
              
              if (!$scope.isNotEmpty) return;
              
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
              };
            });
          });
        },
        templateUrl: 'js/tasks/tasks.html'
      };
    });
});
