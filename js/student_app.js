require(['app_bar/app_bar', 'tasks/tasks', 'schedule_tasks/schedule_tasks',
    'user/user'], function() {
  angular.module('AppModule', ['AppBarModule', 'TasksModule',
      'ScheduleTasksModule', 'UserModule']);

    angular.element(document).ready(function() {
      angular.bootstrap(document, ['AppModule']);
    });
});
