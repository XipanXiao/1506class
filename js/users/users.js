define('users/users', ['new_user_dialog/new_user_dialog', 'permission', 'services',
    'user_editor/user_editor', 'utils'], function() {

  return angular.module('UsersModule', ['NewUserDialogModule', 'PermissionModule', 'ServicesModule',
    'UserEditorModule', 'UtilsModule'])
        .directive('users', function($rootScope, perm, rpc, utils) {
      return {
        scope: {
          classId: '='
        },
        link: function($scope) {
          $scope.entrances = ['本站', '微信', 'zbfw'];
          $scope.isNewClass = function() {
            return $scope.classId === 1;
          };
          $scope.reload = function(classId) {
            if (!classId) {
              $scope.users = [];
              $scope.editingUser = null;
              $scope.isNotEmpty = false;
            } else {
              rpc.get_users(null, classId).then(function(response) {
                $scope.users = response.data;
                $scope.userNames = {};
                for (var id in $scope.users) {
                  var user = $scope.users[id];
                  $scope.userNames[user.id] = user.name;
                  $scope.updateEnroll(user, true);
                  utils.setCountryLabels(user);
                }

                $scope.isNotEmpty = !utils.isEmpty($scope.users);
                $scope.editingUser = $scope.editingUser &&
                    utils.firstElement($scope.users, 'id', $scope.editingUser.id);
              });
            }
          };
          $scope.$watch('classId', function(classId) {
            $scope.reload(classId);
          });
          $scope.isAdmin = function(user) {
            return user.permission > perm.ROLES.STUDENT;
          };
          $scope.showInfo = function(user, index) {
            $scope.editingUser = user;
            $scope.selectedTop = index * 32;
          };
          $scope.$on('editing-user-changed', function(event, editingUser) {
            $scope.editingUser = editingUser;
          });
          $scope.remove = function(user) {
            if (confirm('Are you sure to remove ' + user.email + '?')) {
              rpc.remove_user(user.id).then(function() {
                $scope.reload($scope.classId);
              });
            }
          };
          $scope.selected = function(user) {
            return $scope.editingUser && $scope.editingUser.id === user.id;
          };
          $scope.showNewUserDialog = function() {
            document.getElementById('new-user-dlg').open();
          };
          $scope.updateEnroll = function(user, decode) {
            if (decode) {
              user.welcomed = (user.enroll_tasks & 1) != 0;
              user.wechated = (user.enroll_tasks & 2) != 0;
              user.yyed = (user.enroll_tasks & 4) != 0;
              user.tested = (user.enroll_tasks & 8) != 0;
            } else {
              user.enroll_tasks = utils.makeBits([user.welcomed, user.wechated,
                  user.yyed, user.tested]);
              rpc.update_user({id: user.id, enroll_tasks: user.enroll_tasks});
            }
          };
        },
        templateUrl : 'js/users/users.html'
      };
    });
});

