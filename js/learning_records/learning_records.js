define(['services'], function() {
	return angular.module('LearningRecordsModule', ['ServicesModule'])
		.controller('LearningRecordsController', function($scope, rpc) {

			rpc.get_schedules(true).then(function(response) {
				$scope.schedules = response.data;
			});
		})
		.directive('learningRecords',
				function() {
					return {
						templateUrl : 'js/learning_records/learning_records.html'
					};
				});
});
