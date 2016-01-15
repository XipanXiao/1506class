require(['app_bar/app_bar', 'classes/classes', 'task_stats/task_stats',
    'users/users', 'learning_records/learning_records'], function() {
  angular.module('AppModule', ['AppBarModule', 'ClassesModule',
      'TaskStatsModule', 'UsersModule', 'LearningRecordsModule'])
      .directive('body', function(rpc) {
        return {
          link: function($scope) {
            rpc.get_user().then(function(user) {
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
