define(['permission', 'search_bar/search_bar'], function() {
  return angular.module('AppBarModule', ['PermissionModule', 'SearchBarModule'])
    .directive('appBar', function(perm) {
      return {
        scope: {
          admining: '@',
          user: '='
        },
        link: function(scope) {
          scope.isAdmin = function() {
            if (!scope.user) return;
            perm.user = scope.user;
            return perm.isAdmin();
          };
        },
        templateUrl : 'js/app_bar/app_bar.html'
      };
    });
});
