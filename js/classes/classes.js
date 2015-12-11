define(['services'], function() {
	return angular.module('ClassesModule', ['ServicesModule'])
		.controller('ClassesController', function($scope, $parse, rpc) {
				rpc.get_classes().then(function(response) {
					$scope.classes = response.data;
					$scope.selectedIndex = 0;
					
					$scope.selected = function (index) {
						$scope.selectedIndex = index;
						if ($scope.classSelected) {
							//$scope.classSelected($scope.classes[index]);
							$scope.exp = $parse($scope.classSelected);
							//$scope.$apply(exp);
							$scope.exp();
						}
					}
				});
			})
		.directive('classes', function() {
			return {
				link: function(scope, element, attributes) {
				    scope.listType = attributes["listType"];
				    scope.classSelected = attributes['classSelected'];
				},
				templateUrl : 'js/classes/classes.html'
			};
		});
});
