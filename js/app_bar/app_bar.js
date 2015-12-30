define(['services'], function() {
	return angular.module('AppBarModule', ['ServicesModule'])
		.directive('appBar',
				function($rootScope, rpc) {
					return {
					  scope: {
					    admining: '=',
					    user: '='
					  },
						templateUrl : 'js/app_bar/app_bar.html'
					};
				});
});
