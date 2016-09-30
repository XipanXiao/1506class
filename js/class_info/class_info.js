define('class_info/class_info', ['bit_editor/bit_editor', 'importers',
    'class_editor/class_editor',
    'new_user_dialog/new_user_dialog', 
    'users/users',
    'permission', 'services',
    'utils',
    'zb_sync_button/zb_sync_button'], function() {

  return angular.module('ClassInfoModule', ['BitEditorModule',
    'ImportersModule',
    'ClassEditorModule',
    'NewUserDialogModule',
    'UsersModule',
    'PermissionModule', 'ServicesModule',
    'UtilsModule', 'ZBSyncButtonModule'])
        .directive('classInfo', function($rootScope, importers, perm, rpc, 
            utils) {
      return {
        scope: {
          classId: '='
        },
        restrict: 'E',
        link: function($scope) {
          $scope.isNewClass = function() {
            return $scope.classId === 1;
          };
          $scope.reload = function(classId) {
            if (!classId) {
              $scope.users = [];
            } else {
              rpc.get_users(null, classId).then(function(response) {
                $scope.users = response.data;
              });
            }
          };
          $scope.$watch('classId', function(classId) {
            $scope.reload(classId);
          });
          $scope.isSysAdmin = function() {
            return perm.isSysAdmin();
          };
          $scope.showNewUserDialog = function() {
            document.getElementById('new-user-dlg').open();
          };
          $scope.exportUsers = function() {
            importers.userImporter.exportUsers([$scope.classId],
                $scope.exportedUrl).then(function(url) {
                  $scope.exportedUrl = url;
                });
          };
          $scope.userCount = function() {
            return $scope.users && utils.keys($scope.users).length;
          };
        },
        templateUrl : 'js/class_info/class_info.html'
      };
    });
});
