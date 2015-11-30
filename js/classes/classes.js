angular.module('ClassesModule', [])
.controller('ClassesController', function($scope, $http) {
	get_classes($http).then(function(response) {
		$scope.classList = response.data;
	});
})
.directive('classes', function() {
  return {
    templateUrl: 'js/classes/classes.html'
  };
});
