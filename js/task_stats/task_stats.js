define('task_stats/task_stats', ['progress_bar/progress_bar', 'services',
    'task_editor_dialog/task_editor_dialog',
    'task_history/task_history',
    'utils'], function() {
  return angular.module('TaskStatsModule', ['ProgressBarModule',
      'ServicesModule', 'TaskEditorDialogModule',
      'TaskHistoryModule', 'UtilsModule'])
      .directive('taskStats', function(rpc, utils) {

      return {
        scope: {
          admining: '@',
          classId: '@'
        },
        link: function(scope) {
          var pageSize = 8;
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
              });
            });
          };
          
          scope.$watch('classId', function() {
            scope.reload();
          });
          scope.$watch('selectedTask', function() {
            scope.refreshStats();
          });
          scope.range = function() {
            var arr = [];
            var start = scope.currentPage, end = start + pageSize;
            for (var i = start; i < end; i++) arr[i-start] = i;
            return arr;
          };
          scope.page = function(delta) {
            scope.currentPage += delta * pageSize;
            var max = scope.selectedTask.sub_tasks - pageSize;
            if (scope.currentPage > max) scope.currentPage = max;
            else if (scope.currentPage < 0) scope.currentPage = 0;
          };
          scope.reportTask = function(user) {
            var data = {
                student_id: user.id,
                task_id: scope.selectedTask.id,
                count: user.count,
                sub_index: user.sub_index - 1,
                duration: user.duration || 0
              };

            if (!utils.validateTaskInput(scope.selectedTask, data)) return;

            rpc.report_task(data).then(function (response) {
              scope.refreshStats();
            });
          };
          scope.select = function(user) {
            scope.selectedUser = user;
          };
          scope.selected = function(user) {
            return scope.selectedUser && scope.selectedUser.id == user.id;
          };
          scope.currentPage = 0;
        },
        templateUrl: 'js/task_stats/task_stats.html'
      };
    });
});
