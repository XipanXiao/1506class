define('zb_login_dialog/zb_login_dialog', [], function() {
  return angular.module('ZBLoginDialogModule',
      ['ServicesModule']).directive('zbLoginDialog',
    function($rootScope, rpc) {
      return {
        link: function(scope) {
          rpc.get_user().then(function(user) {
            scope.username = user.name + '1506';
          });
        scope.close = function(ok) {
            $rootScope.$broadcast('zb-login-confirmed', ok ? scope : null);
          };
        },
        templateUrl : 'js/zb_login_dialog/zb_login_dialog.html?tag=2019'
      };
    });
});
