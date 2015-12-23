require(["app_bar/app_bar", "classes/classes", "users/users", 
    "learning_records/learning_records"], function() {
  angular.module('AppModule', ['AppBarModule', 'ClassesModule', 'UsersModule',
      'LearningRecordsModule']);

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});
