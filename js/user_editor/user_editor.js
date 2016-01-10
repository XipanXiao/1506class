define(['services', 'utils', 'classes/classes'], function() {
  return angular.module('UserEditorModule', ['ServicesModule', 'ClassesModule',
      'UtilsModule']).directive('userEditor', function(rpc, utils) {
    return {
      scope: {
        user: '='
      },
      link: function($scope) {
        $scope.sexLabel = ['女', '男'];

        $scope.$watch('user', function() {
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
          default:
            data[$scope.editing] = user[$scope.editing];
            break;
          }
          
          rpc.update_user(data).then(function(response) {
            if (response.data.updated) {
              window.location.href = window.location.href;
            }
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
