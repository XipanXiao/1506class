angular.module('ClassLabelModule', [])
.directive('classLabel', function() {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function(scope, element, attrs, ngModel) {
        ngModel.$formatters.push(function(classId) {
          var info = window.classInfos[classId];
          return info && info.name;
        });
    },
  };
});
