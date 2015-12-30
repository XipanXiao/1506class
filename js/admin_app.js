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
          }
        }
      });

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});
