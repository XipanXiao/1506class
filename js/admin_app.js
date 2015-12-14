require(["app_bar/app_bar", "classes/classes", "users/users", 
         "learning_records/learning_records", "tasks/tasks", "schedule_tasks/schedule_tasks"], function() {
	angular.module('AppModule', ['AppBarModule', 'ClassesModule', 
	     'UsersModule', 'LearningRecordsModule', 'TasksModule', 'ScheduleTasksModule']);

	angular.element(document).ready(function() {
		angular.bootstrap(document, ['AppModule']);
	});
});
