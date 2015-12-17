define(['services'], function() {
	return angular.module('LearningRecordsModule', ['ServicesModule'])
		.controller('LearningRecordsController', function($scope, rpc) {
			$scope.$on('class-selected', function(event, classInfo) {
				rpc.get_learning_records(classInfo.id).then(function(response) {
					$scope.schedules_groups = response.data;
				});
			});
		})
		.directive('learningRecords',
				function() {
					return {
						templateUrl : 'js/learning_records/learning_records.html'
					};
				});
});
