define(['services'], function() {
	return angular.module('AppBarModule', ['ServicesModule'])
		.controller('AppBarController', function($scope, rpc) {

			rpc.get_users().then(function(response) {
				if (response.data.error == "login needed") {
					window.location.href = "./login.html";
				} else {
					$scope.user = response.data[0];
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
