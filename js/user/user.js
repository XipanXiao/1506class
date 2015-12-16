define(['services'], function() {
	return angular.module('UserModule', ['ServicesModule'])
		.controller('UserController', function($scope, rpc) {
			$scope.$on('user-loaded', function(event, user) {
				$scope.user = user;
			});
		})
		.directive('user', function() {
			return {
				templateUrl : 'js/user/user.html'
			};
		});
});
