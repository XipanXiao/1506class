require(["tasks/tasks", "schedule_tasks/schedule_tasks"], function() {
	angular.module('AppModule', ['TasksModule', 'ScheduleTasksModule']);

	angular.element(document).ready(function() {
		angular.bootstrap(document, ['AppModule']);
	});
});
