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
          $scope.$watch('classId', function(classId) {
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
          });
          $scope.isAdmin = function(user) {
            return user.permission > perm.ROLES.STUDENT;
          };
          $scope.showInfo = function(user) {
            $scope.editingUser = user;
          };
          $scope.$on('editing-user-changed', function(event, editingUser) {
            $scope.editingUser = editingUser;
          });
        },
        templateUrl : 'js/users/users.html'
      };
    });
});
