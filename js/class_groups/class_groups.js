define(['services'], function() {
	return angular.module('ClassGroupsModule', ['ServicesModule'])
		.controller('ClassGroupsController', function($scope, rpc) {
				rpc.get_class_groups().then(function(response) {
					$scope.groups = response.data;
				});
			})
		.directive('classGroups', function() {
			return {
				templateUrl : 'js/class_groups/class_groups.html'
			};
		});
});
