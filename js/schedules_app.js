require(["app_bar/app_bar", "classes/classes",
    "schedule_editor/schedule_editor"], function() {

  angular.module('AppModule', ['AppBarModule', 'ClassesModule', 
      'ScheduleEditorModule']);

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});
