define(['services'], function() {
	return angular.module('ClassesModule', ['ServicesModule'])
		.controller('ClassesController', function($scope, $rootScope, rpc) {
				rpc.get_classes().then(function(response) {
					$scope.classes = response.data;
					
					$scope.selected = function (id) {
						$scope.selectedId = id;
						$rootScope.$broadcast('class-selected', $scope.classes[id]);
					};
					
					$scope.selected(1);
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
