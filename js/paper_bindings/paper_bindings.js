angular.module('PaperBindingsModule', [
  ]).directive('paperInput', function() {
    return {
      restrict: 'E',
      require: 'ngModel',
      link: function(scope, elements, attrs, ngModel) {
        var element = elements[0];
        element.value = ngModel.$modelValue;

        ngModel.$formatters.push((modelValue) => {
          var value = modelValue || '';
          var input = element.querySelector('input');
          if (input) {
            input.value = value;
          } else {
            element.setAttribute('value', value);
          }
        });

        element.addEventListener('input', (event) => {
          ngModel.$setViewValue(event.target.value);
        });
      }
    };
});
