define(["search_bar/search_bar"], function() {
	return angular.module('AppBarModule', ["SearchBarModule"])
		.directive('appBar', function() {
					return {
					  scope: {
					    admining: '=',
					    user: '='
					  },
						templateUrl : 'js/app_bar/app_bar.html'
					};
				});
});
