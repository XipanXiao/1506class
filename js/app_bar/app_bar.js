define('app_bar/app_bar', ['permission', 'search_bar/search_bar'], function() {
  return angular.module('AppBarModule', ['PermissionModule', 'SearchBarModule'])
    .directive('appBar', function(perm) {
      return {
        scope: {
          admining: '@',
          user: '='
        },
        link: function(scope) {
          scope.isAdmin = function() {
            return perm.isAdmin();
          };
          scope.isSysAdmin = function() {
            return perm.isSysAdmin();
          };
        },
        templateUrl : 'js/app_bar/app_bar.html'
      };
    });
});
