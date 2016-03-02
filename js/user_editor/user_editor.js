define('user_editor/user_editor',
    ['services', 'utils', 'classes/classes', 'permission'], function() {
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
        $scope.educationLabels = ['', '高中及以下', '大专', '本科', '硕士', '博士'];
        $scope.volunteerLabels =
            ['', '暂时先不', '小组管理', '资料收发', '统计报数', '其他工作'];
        $scope.channelLabels = ['', '其他方式', '智悲佛网', '国际佛学网',
            '美国智悲菩提讲修', '本地招生材料', '微信', '微博或论坛', '朋友介绍'];
        $scope.entrances = ['本站', '微信', 'zbfw'];

        $scope.permissionLabel = perm.permissions;
        $scope.permissions = perm.lowerPermissions();
        $scope.isSysAdmin = function() {
          return perm.isSysAdmin();
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
            data.city = user.city;
            data.state = user.state;
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
