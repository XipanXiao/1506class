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
}).directive('paperTab', function() {
  return {
    restrict: 'E',
    link: function(scope, elements, attrs, ngModel) {
      var element = elements[0];
      element.addEventListener('click', (event) => {
        var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isFirefox) {
          var tabs = element.closest('paper-tabs');
          if (!tabs) return;
          var children = tabs.querySelectorAll('paper-tab');
          if (!children) return;
          var index = -1;
          for (var i = 0; i < children.length; i++) {
            if (children[i] == element) {
              index = i;
              break;
            }
          }
          if (index < 0) return;
          var pages = tabs.parentNode.querySelector('iron-pages');
          setTimeout(function() {
            if (!pages || parseInt(pages.selected) == index) return;
            var oldPage = pages.children[parseInt(pages.selected)];
            if (oldPage) {
              oldPage.classList.remove('iron-selected');
            }
            var newPage = pages.children[index];
            if (newPage) {
              pages.selected = '' + index;
              newPage.classList.add('iron-selected');
            }
          }, 250);
        }
      });
    }
  };
});
;
