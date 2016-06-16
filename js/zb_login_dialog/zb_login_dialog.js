define('zb_login_dialog/zb_login_dialog', [], function() {
  return angular.module('ZBLoginDialogModule', []).directive('zbLoginDialog',
    function() {
      return {
        link: function(scope) {
          scope.ok = function() {
            scope.$broadcast('zb-login-confirmed', {
              username: document.querySelector('#zb-username').value,
              password: document.querySelector('#zb-password').value,
              editPassword: document.querySelector('#zb-editpassword').value
            });
          };
        },
        templateUrl : 'js/zb_login_dialog/zb_login_dialog.html'
      };
    });
});
