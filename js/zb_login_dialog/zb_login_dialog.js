define('zb_login_dialog/zb_login_dialog', [], function() {
  return angular.module('ZBLoginDialogModule', [
      'ServicesModule',
      'ZBServicesModule',
    ]).directive('zbLoginDialog',
    function($rootScope, rpc, zbrpc) {
      return {
        scope: {
          deferredLogin: '=',
          progress: '&'
        },
        link: function(scope) {
          rpc.get_user().then(function(user) {
            scope.username = user.name + '1506';
          });

          scope.cancel = function() {
            scope.deferredLogin.resolve(null);
          };

          scope.login = function() {
            var credential = scope;
            var username = credential.username;
            var password = credential.password;
            var editPassword = credential.editPassword;
            var captcha = credential.captcha;

            scope.progress(1, '正在登录...');
            zbrpc.login(username, password, captcha).then(function(response) {
              var success = response.data &&
                  (response.data.returnValue == 'true');
              if (!success) {
                scope.progress(1);
                alert('登录失败');
                scope.deferredLogin.resolve(false);
              } else {
                zbrpc.edit(editPassword).then(function(approved) {
                  scope.progress(1);
                  scope.deferredLogin.resolve(approved);
                });
              }
            });
          };
        },
        templateUrl : 'js/zb_login_dialog/zb_login_dialog.html?tag=20190604'
      };
    });
});
