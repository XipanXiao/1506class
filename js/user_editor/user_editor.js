define(['services', 'utils', 'classes/classes', 'permission'], function() {
  return angular.module('UserEditorModule', ['ServicesModule', 'ClassesModule',
      'PermissionModule', 'UtilsModule']).directive('userEditor',
          function($rootScope, perm, rpc, utils) {
    return {
      scope: {
        classMates: '=',
        user: '='
      },
      link: function($scope) {
        $scope.sexLabel = ['女', '男'];
        $scope.permissionLabel = perm.permissions;
        $scope.permissions = perm.lowerPermissions();
        $scope.canGrant = function(permission) {
          return perm.canGrant(permission);
        };

        $scope.$watch('user', function() {
          $scope.editing = null;
          if (!$scope.user || $scope.user.classInfo) return;

          var classId = $scope.user.classId;
          rpc.get_classes(classId).then(function(response) {
            $scope.user.classInfo =
              response.data[classId] || response.data['' + classId];
          });
        });

        $scope.save = function() {
          var user = $scope.user;
          var data = {id: user.id};
          switch ($scope.editing) {
          case 'address':
            data.street = user.street;
            data.street2 = user.street2;
            data.city = user.city;
            data.state = user.state;
            data.zip = user.zip;
            break;
          case 'password':
            if (user.password != user.confirm) return;
          default:
            data[$scope.editing] = user[$scope.editing];
            break;
          }
          
          rpc.update_user(data).then(function(response) {
            if (response.data.updated && $scope.editing == 'classId') {
              $rootScope.$broadcast('class-updated', user.classId);
            }
            
            if (response.data.updated) $scope.editing = null;
          });
        };
        
        $scope.admining = window.location.href.indexOf('admin.html') > 0;
        $scope.stateMap = utils.stateMap;
        $scope.states = utils.keys($scope.stateMap);
      },

      templateUrl : 'js/user_editor/user_editor.html'
    };
  });
});
