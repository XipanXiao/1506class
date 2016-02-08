define(['permission', 'services', 'user_editor/user_editor', 'utils'],
    function() {

  return angular.module('UsersModule', ['PermissionModule', 'ServicesModule',
    'UserEditorModule', 'UtilsModule'])
        .directive('users', function($rootScope, perm, rpc, utils) {
      return {
        scope: {
          classId: '=',
        },
        link: function($scope) {
          $scope.reload = function(classId) {
            if (!classId) {
              $scope.users = [];
              $scope.editingUser = null;
              $scope.isNotEmpty = false;
            } else {
              rpc.get_users(null, classId).then(function(response) {
                $scope.users = response.data;
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
            return $scope.editingUser && $scope.editingUser.id == user.id;
          };
        },
        templateUrl : 'js/users/users.html'
      };
    });
});
