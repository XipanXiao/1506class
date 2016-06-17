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
              $scope.tasks = [];
              
              angular.forEach(response.data, function(task) {
                if ($scope.half_term &&
                    $scope.half_term < task.starting_half_term) return;

                task = angular.copy(task);
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
              $scope.isNotEmpty = !utils.isEmpty($scope.tasks);
            });
          });
              
          $scope.reportTask = function(task) {
            var data = {
              task_id: task.id,
              count: task.record.count,
              sub_index: task.lastRecord.sub_index,
              duration: task.record.duration || 0
            };

            if (!utils.validateTaskInput(task, data)) return;

            $scope.reporting = true;
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
          $scope.filterTasks = function(tasks) {
            if (!$scope.half_term) return tasks;
            return utils.where(tasks, function(task) {
              return $scope.half_term >= task.starting_half_term;
            });
          };
          $scope.$on('set-half-term', function(event, half_term) {
            $scope.half_term = half_term;
            $scope.tasks = $scope.filterTasks($scope.tasks);
          });
          $scope.tasks = [];
        },
        templateUrl: 'js/tasks/tasks.html'
      };
    });
});
