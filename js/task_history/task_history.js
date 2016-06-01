define('task_history/task_history', ['utils',
    'services'], function() {
  return angular.module('TaskHistoryModule', ['UtilsModule',
      'ServicesModule']).directive('taskHistory',
      function(utils, rpc) {
    return {
      scope: {
        user: '='
      },
      restrict: 'E',
      link: function(scope, element, attrs) {
        scope.$watch('user', function() {
          if (!scope.user) return;
          var depId = scope.user.classInfo.department_id;
          rpc.get_tasks(depId).then(function(response) {
            scope.tasks = response.data;
            scope.selectedTask = utils.first(scope.tasks);
          });
        });

        scope.$watch('selectedTask', function() {
          if (!scope.selectedTask) return;

          scope.reloadTaskHistory();
        });
        
        scope.reloadTaskHistory = function() {
          rpc.get_task_history(scope.user.id, scope.selectedTask.id)
              .then(function(response) {
            scope.task_history = response.data;
            var sum = 0;
            var totalDuration = 0;
            for (var index = 0; index < scope.task_history.length; index++) {
              var record = scope.task_history[index];
              record.sum = (sum += parseInt(record.count));
              record.totalDuration = 
                  (totalDuration += parseInt(record.duration));
            }
          });
        };
        
        scope.remove = function(id) {
          rpc.remove_task_record(scope.user.id, id).then(function(response) {
            if (response.data.deleted) {
              scope.reloadTaskHistory();
            }
          });
        };
      },
      templateUrl : 'js/task_history/task_history.html'
    };
  });
});
