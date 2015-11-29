require(["tasks/tasks"], function() {
	angular.module('AppModule', ['TasksModule']);

	angular.element(document).ready(function() {
		angular.bootstrap(document, ['AppModule']);
	});
});
