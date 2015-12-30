require(['app_bar/app_bar', 'tasks/tasks', 'schedule_tasks/schedule_tasks',
    'user_editor/user_editor', 'services'], function() {
  angular.module('AppModule', ['AppBarModule', 'TasksModule',
      'ScheduleTasksModule', 'UserEditorModule', 'ServicesModule'])
      .directive('body', function(rpc) {
        return {
          link: function($scope) {
            rpc.get_user().then(function(user) {
              $scope.user = user;
            });
          }
        }
      });

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});
