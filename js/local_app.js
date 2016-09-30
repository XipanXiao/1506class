define('local_app', [
    'app_bar/app_bar',
    'address_filter/address_filter',
    'users/users',
    'services',
    'permission',
    'utils'],
    function() {

  angular.module('AppModule', [
      'AppBarModule',
      'AddressFilterModule',
      'UsersModule',
      'PermissionModule',
      'ServicesModule',
      'UtilsModule',
      ])
      .directive('body', function(rpc, perm, utils) {
        return {
          link: function($scope) {
            rpc.get_user().then(function(user) {
              perm.user = user;
              if (!perm.isSysAdmin()) {
                utils.redirect('login.html');
                return;
              }

              $scope.user = user;
            });
            $scope.$on('users-selected', function(event, users) {
              $scope.users = users;
            });
          }
        };
      }).config( ['$compileProvider', function( $compileProvider ) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
      }]);;

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['local_app']);
