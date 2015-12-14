define(['services'], function() {
	return angular.module('UsersModule', ['ServicesModule'])
		.controller('UsersController', function($scope, rpc) {
				rpc.get_users(null, 4).then(function(response) {
					$scope.users = response.data;
				});
			})
		.directive('users', function() {
			return {
				templateUrl : 'js/users/users.html'
			};
		});
});
