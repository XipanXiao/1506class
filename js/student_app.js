define('student_app', ['app_bar/app_bar', 'setup_tasks/setup_tasks',
    'tasks/tasks', 'schedule_tasks/schedule_tasks', 'user_editor/user_editor',
    'permission', 'services'], function() {

  angular.module('AppModule', ['AppBarModule', 'SetupTasksModule',
      'TasksModule', 'ScheduleTasksModule', 'UserEditorModule',
      'PermissionModule', 'ServicesModule'])
      .directive('body', function(perm, rpc) {
        return {
          link: function($scope) {
            rpc.get_user().then(function(user) {
              $scope.user = user;
              perm.user = user;

              $scope.isFirstClass = function() {
                return user.classInfo && user.classInfo.department_id == 1;
              };
            });
          }
        };
      });

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});

require(['student_app']);
