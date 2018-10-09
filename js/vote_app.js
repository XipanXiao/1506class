angular.module('AppModule', [
  'AppBarModule',
  'PermissionModule',
  'ServicesModule'
]).directive('body', function(perm, rpc) {
  return {
    link: function(scope) {
      rpc.get_user().then(function(user) {
        scope.user = user;
        perm.user = user;
      });
    }
  };
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['AppModule']);
});
