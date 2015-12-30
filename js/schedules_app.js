require(["app_bar/app_bar", "classes/classes",
    "schedule_editor/schedule_editor"], function() {

  angular.module('AppModule', ['AppBarModule', 'ClassesModule', 
      'ScheduleEditorModule'])
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
