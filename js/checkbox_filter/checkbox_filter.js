define('checkbox_filter/checkbox_filter', [
    'utils'], function() {
  return angular.module('CheckboxFilterModule', [
      'UtilsModule']).directive('checkboxFilter',
          function($rootScope, rpc, utils) {
      return {
        scope: {
          options: '=',
          selectionChanged: '&'
        },
        link: function(scope) {
          scope.invert = function() {
            utils.forEach(scope.options, function(option) {
              option.checked = !option.checked;
            });
            scope.selectionChanged();
          };
        },
        templateUrl : 'js/checkbox_filter/checkbox_filter.html?tag=2019'
      };
    });
});
