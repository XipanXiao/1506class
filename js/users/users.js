define(['services', 'user/user'], function() {
	return angular.module('UsersModule', ['ServicesModule', 'UserModule'])
		.controller('UsersController', function($scope, $rootScope, rpc) {
			$scope.$on('class-selected', function(event, classInfo) {
				rpc.get_users(null, classInfo.id).then(function(response) {
					$scope.users = response.data;
				});
			});

			$scope.showInfo = function(user) {
			  $scope.user = user;
			};
		})
		.directive('users', function() {
			return {
				templateUrl : 'js/users/users.html'
			};
		});
});
