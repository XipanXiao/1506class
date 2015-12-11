require(["app_bar/app_bar", "classes/classes", "learning_records/learning_records"], function() {
	angular.module('AppModule', ['AppBarModule', 'ClassesModule', 'LearningRecordsModule']);

	angular.element(document).ready(function() {
		angular.bootstrap(document, ['AppModule']);
	});
});
