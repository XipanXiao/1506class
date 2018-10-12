angular.module('PaperBindingsModule', [
  ]).directive('bindValue', function() {
    return {
      scope: {
        bindValue: '=',
        onChange: '&'
      },
      link: function(scope, elements, attrs, ngModel) {
        var element = elements[0];
        element.value = scope.bindValue;

        scope.$watch('bindValue', () => {
          if (scope.bindValue != element.value) {
            var input = element.querySelector('input');
            if (input) {
              input.value = scope.bindValue || '';
            } else {
              element.setAttribute('value', scope.bindValue || '');
            }
          }
        });
        element.addEventListener('input', (event) => {
          scope.bindValue = event.target.value;
          scope.onChange();
          scope.$apply();
        });
      }
    };
});
