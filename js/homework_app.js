require(["app_bar/app_bar", "tasks/tasks", "schedule_tasks/schedule_tasks"], function() {
	angular.module('AppModule', ['AppBarModule', 'TasksModule', 'ScheduleTasksModule']);

	angular.element(document).ready(function() {
		angular.bootstrap(document, ['AppModule']);
	});
});
