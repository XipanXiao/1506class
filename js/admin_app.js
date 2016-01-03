require(["app_bar/app_bar", "classes/classes", "users/users", 
    "learning_records/learning_records"], function() {
  angular.module('AppModule', ['AppBarModule', 'ClassesModule', 'UsersModule',
      'LearningRecordsModule'])
      .directive('body', function(rpc) {
        return {
          link: function($scope) {
            rpc.get_user().then(function(user) {
              $scope.user = user;
              $scope.classId = user.classId;
            });
            
            $scope.$on('editing-user-changed', function(event, editingUser) {
              if (!editingUser) return;
              document.querySelector('paper-tabs').selected = 0;
              document.querySelector('iron-pages').selected = 0;
            });
          }
        }
      });

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});
