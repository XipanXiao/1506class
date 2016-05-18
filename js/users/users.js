define('users/users', ['bit_editor/bit_editor', 'importers',
    'new_user_dialog/new_user_dialog', 'permission', 'services',
    'user_editor/user_editor', 'utils'], function() {

  return angular.module('UsersModule', ['BitEditorModule', 'ImportersModule',
    'NewUserDialogModule', 'PermissionModule', 'ServicesModule',
    'UserEditorModule', 'UtilsModule'])
        .directive('users', function($rootScope, importers, perm, rpc, utils) {
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
          $scope.isSysAdmin = function() {
            return perm.isSysAdmin();
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
          $scope.updateEnroll = function(user) {
            rpc.update_user({id: user.id, enroll_tasks: user.enroll_tasks});
          };
          $scope.exportUsers = function() {
            importers.userImporter.exportUsers($scope.classId,
                $scope.exportedUrl).then(function(url) {
                  $scope.exportedUrl = url;
                });
          };
        },
        templateUrl : 'js/users/users.html'
      };
    });
});

