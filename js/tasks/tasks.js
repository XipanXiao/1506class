define('tasks/tasks', ['progress_bar/progress_bar', 'services', 'utils'],
    function() {
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
                  var lastRecord = response.data;
                  task.lastRecord = lastRecord.ts ? lastRecord : {
                    sub_index: 0
                  };
                });
                
                task.lastRecord = null;
                task.record = {count: 0};
                task.sub_indexes = Array.apply(null, {length: task.sub_tasks})
                    .map(Number.call, Number);
                
                $scope.tasks.push(task);
              });
              
              $scope.reportTask = function(task) {
                $scope.reporting = true;

                var data = {
                  task_id: task.id,
                  count: task.record.count,
                  sub_index: task.lastRecord.sub_index,
                  duration: task.record.duration || 0
                };
                rpc.report_task(data).then(function (response) {
                  task.lastRecord = response.data;
                  $rootScope.$broadcast('task-reported');
                }).finally(function() {
                  $scope.reporting = false;
                });
              };
              
              $scope.subTaskSelected = function(task) {
                var sub_index = task.lastRecord.sub_index;

                rpc.get_last_task_record(task.id, sub_index)
                    .then(function(response) {
                  var lastRecord = response.data;
                  task.lastRecord =
                      lastRecord.ts ? lastRecord : {sub_index: sub_index};
                });
              };
              
              $scope.toLocalTime = function(uts) {
                return utils.toDateTime(uts).toLocaleString();
              };
            });
          });
        },
        templateUrl: 'js/tasks/tasks.html'
      };
    });
});
