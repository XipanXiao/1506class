define(['services'], function() {
	return angular.module('UsersModule', ['ServicesModule'])
		.controller('UsersController', function($scope, rpc) {
			$scope.$on('class-selected', function(event, classInfo) {
				rpc.get_users(null, classInfo.id).then(function(response) {
					$scope.users = response.data;
				});
			});
		})
		.directive('users', function() {
			return {
				templateUrl : 'js/users/users.html'
			};
		});
});
