define('tasks/tasks',
    ['progress_bar/progress_bar', 'services', 'utils'], function() {
  return angular.module('TasksModule', ['ProgressBarModule', 'ServicesModule',
      'UtilsModule']).directive('tasks', function($rootScope, rpc, utils) {
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
                  if (task.lastRecord && task.lastRecord.ts) {
                    task.lastRecord.ts = new Date(task.lastRecord.ts).
                        toLocaleString();
                  }
                });
                
                task.lastRecord = null;
                task.record = {count: 0};
                
                $scope.tasks.push(task);
              });
              
              $scope.reportTask = function(task) {
                $scope.reporting = true;

                var data = {
                  task_id: task.id,
                  count: task.record.count,
                  duration: task.record.duration || 0
                };
                rpc.report_task(data).then(function (response) {
                  task.lastRecord = response.data;
                  $rootScope.$broadcast('task-reported');
                }).finally(function() {
                  $scope.reporting = false;
                });
              };
            });
          });
        },
        templateUrl: 'js/tasks/tasks.html'
      };
    });
});
