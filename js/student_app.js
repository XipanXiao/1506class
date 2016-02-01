require(['app_bar/app_bar', 'tasks/tasks', 'schedule_tasks/schedule_tasks',
    'task_stats/task_stats', 'user_editor/user_editor', 'services'],
    function() {

  angular.module('AppModule', ['AppBarModule', 'TasksModule',
      'ScheduleTasksModule', 'TaskStatsModule', 'UserEditorModule',
      'ServicesModule']).directive('body', function(rpc) {
        return {
          link: function($scope) {
            rpc.get_user().then(function(user) {
              $scope.user = user;
              $scope.hasTask = user.classInfo.department_id > 1;
            });
          }
        }
      });

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});
