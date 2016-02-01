require(['app_bar/app_bar', 'tasks/tasks', 'schedule_tasks/schedule_tasks',
    'task_stats/task_stats', 'user_editor/user_editor', 'permission',
    'services'],
    function() {

  angular.module('AppModule', ['AppBarModule', 'TasksModule',
      'ScheduleTasksModule', 'TaskStatsModule', 'UserEditorModule',
      'PermissionModule', 'ServicesModule'])
      .directive('body', function(perm, rpc) {
        return {
          link: function($scope) {
            rpc.get_user().then(function(user) {
              $scope.user = user;
              perm.user = user;
              $scope.hasTask = user.classInfo.department_id > 1;
            });
          }
        }
      });

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});
