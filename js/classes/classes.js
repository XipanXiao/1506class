define(['services'], function() {
	return angular.module('ClassesModule', ['ServicesModule'])
		.controller('ClassesController', function($scope, rpc) {
				rpc.get_classes().then(function(response) {
					$scope.classes = response.data;
				});
			})
		.directive('classes', function() {
			return {
				link: function(scope, element, attributes) {
				    scope.listType = attributes["listtype"];
				}, 
				templateUrl : 'js/classes/classes.html'
			};
		});
});
