define(['progress_bar/progress_bar', 'services'], function() {
  return angular.module('TaskStatsModule', ['ProgressBarModule',
      'ServicesModule']).directive('taskStats', function(rpc) {
      return {
        scope: {
          user: '='
        },
        link: function(scope) {
          rpc.get_group_tasks().then(function(response) {
            scope.tasks = response.data;
            scope.selectedTask = scope.tasks[0];
          });
          
          scope.$watch('selectedTask', function() {
            if (!scope.selectedTask) return;
            
            rpc.get_class_task_stats(scope.user.classId, scope.selectedTask.id)
                .then(function(response) {
                  scope.task_stats = response.data;
                });
          });
        },
        templateUrl: 'js/task_stats/task_stats.html'
      };
    });
});
