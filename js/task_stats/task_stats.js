define('task_stats/task_stats', ['progress_bar/progress_bar', 'services',
    'task_editor_dialog/task_editor_dialog', 'utils'], function() {
  return angular.module('TaskStatsModule', ['ProgressBarModule',
      'ServicesModule', 'TaskEditorDialogModule', 'UtilsModule'])
      .directive('taskStats', function(rpc, utils) {

      return {
        scope: {
          admining: '@',
          classId: '@'
        },
        link: function(scope) {
          scope.refreshStats = function() {
            if (!scope.selectedTask) return;
            
            rpc.get_class_task_stats(scope.classId, scope.selectedTask.id)
                .then(function(response) {
                  scope.task_stats = response.data;
                });
          };

          scope.$on('task-reported', function() {
            scope.refreshStats();
          });

          scope.reload = function() {
            if (!parseInt(scope.classId)) {
              scope.tasks = {};
              scope.task_stats = {};
              return;
            }

            rpc.get_classes(scope.classId).then(function(response) {
              var classInfo = response.data[scope.classId];
              rpc.get_tasks(classInfo.department_id).then(function(response) {
                scope.tasks = response.data;
                scope.selectedTask = utils.first(scope.tasks);
                
                scope.refreshStats();
              });
            });
          };
          
          scope.$watch('classId', function() {
            scope.reload();
          });
          scope.$watch('selectedTask', function() {
            scope.refreshStats();
          });
          scope.expand = function() {
            if (scope.admining) {
              document.querySelector('#task-editor-dlg').open();
            }
          };
        },
        templateUrl: 'js/task_stats/task_stats.html'
      };
    });
});
