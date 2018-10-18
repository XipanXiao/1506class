angular.module('FileInputModule', [
]).directive('ngUploadChange',function () {
  return {
    scope: {
      ngUploadChange: '&'
    },
    restrict: 'A',
    link: function($scope, $element) {
      $element.on('change', function(event) {
        $scope.$apply(function() {
          $scope.ngUploadChange({$event: event});
        });
      });
      $scope.$on('$destroy',function() {
        $element.off();
      });
    }
  };
});
