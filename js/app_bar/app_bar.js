define(['services'], function() {
	return angular.module('AppBarModule', ['ServicesModule'])
		.controller('AppBarController', function($scope, $rootScope, rpc) {
			$scope.admining = window.location.href.indexOf('admin.html') > 0;

			rpc.get_users().then(function(response) {
				if (response.data.error == "login needed") {
					window.location.href = "./login.html";
				} else {
					$scope.user = response.data[0];
					$rootScope.$broadcast('user-loaded', $scope.user);
				}
			});
		})
		.directive('appBar',
				function() {
					return {
						templateUrl : 'js/app_bar/app_bar.html'
					};
				});
});
