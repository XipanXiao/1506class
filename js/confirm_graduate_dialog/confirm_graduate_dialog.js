angular.module('ConfirmGraduateDialogModule', [
  'ClassesModule',
  'ServicesModule',
  'UtilsModule',
]).directive('confirmGraduateDialog', function (rpc, utils) {
  return {
    scope: {
      classInfo: '='
    },
    link: function (scope) {
      scope.selectedClass = { id: 1 };

      scope.toggleSelection = function () {
        utils.forEach(scope.classInfo.users, function (user) {
          user.selected = scope.allChecked;
        });
      };

      function markClassGraduate() {
        scope.classInfo.graduated = 1;
        rpc.update_class(scope.classInfo).then(function (response) {
          alert('请记得把email 地址改动同步到zhibei.info.');
          return parseInt(response.data.updated);
        });
      }
      function renameEmail(user) {
        return function () {
          return rpc.clone_user(user.id, user.newEmail, scope.selectedClass.id).then(function (response) {
            if (parseInt(response.data.updated)) {
              user.email = user.newEmail;
              return true;
            }
          });
        };
      }
      scope.graduate = function () {
        var selectedUsers = utils.where(scope.classInfo.users,
          function (user) { return user.selected; });
        var requests = utils.map(selectedUsers, renameEmail);
        requests.push(markClassGraduate);
        utils.requestOneByOne(requests);
      };
    },
    templateUrl: 'js/confirm_graduate_dialog/confirm_graduate_dialog.html?tag=20190604'
  };
});
