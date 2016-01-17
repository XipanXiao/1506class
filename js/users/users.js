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
            if (!classId) return;

            rpc.get_classes(classId).then(function(response) {
              $scope.setupPermissionEditor(response.data[classId]);
            });
            rpc.get_users(null, classId).then(function(response) {
              $scope.users = response.data;
              $scope.editingUser = $scope.editingUser &&
                  utils.firstElement($scope.users, 'id', $scope.editingUser.id);
            });
          });
          $scope.setupPermissionEditor = function(classInfo) {
            $scope.classInfo = classInfo;
            $scope.permissionLabel = {};
            for (var permission in perm.permissions) {
              var label = perm.permissions[permission];
              $scope.permissionLabel[perm.level(permission)] = label; 
            }
            
            $scope.permissions = utils.keys($scope.permissionLabel);

            $scope.showPermEditor = perm.canWrite($scope.classInfo);
            
            $scope.updatePerm = function() {
              var data = {
                id: $scope.classId,
                perm_level: $scope.classInfo.perm_level
              };
              rpc.update_class(data);
            };
          };
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
