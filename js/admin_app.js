require(['app_bar/app_bar', 'classes/classes', 'class_editor/class_editor',
    'task_stats/task_stats', 'users/users', 'learning_records/learning_records',
    'schedule_editor/schedule_editor', 'services', 'permission', 'utils'],
    function() {

  angular.module('AppModule', ['AppBarModule', 'ClassesModule',
      'ClassEditorModule', 'TaskStatsModule', 'UsersModule',
      'LearningRecordsModule', 'PermissionModule', 'ScheduleEditorModule',
      'ServicesModule', 'UtilsModule'])
      .directive('body', function(rpc, perm, utils) {
        return {
          link: function($scope) {
            rpc.get_user().then(function(user) {
              perm.user = user;
              if (!perm.isAdmin()) {
                utils.redirect('login.html');
                return;
              }

              $scope.user = user;
              $scope.classId = user.classId;
            });
            
            var pages = document.querySelector('iron-pages');
            var tabs = document.querySelector('paper-tabs');
             
            tabs.addEventListener('iron-select', function() { 
              pages.selected = tabs.selected;
            });

            $scope.$on('editing-user-changed', function(event, editingUser) {
              if (!editingUser) return;

              tabs.selected = 0;
              pages.selected = 0;
            });
          }
        }
      });

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});
