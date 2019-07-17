define('class_info/class_info', ['bit_editor/bit_editor',
  'class_editor/class_editor',
  'new_user_dialog/new_user_dialog',
  'serial_number_dialog/serial_number_dialog',
  'users/users',
  'permission', 'services',
  'utils',
  'zb_sync_button/zb_sync_button'], function () {

    return angular.module('ClassInfoModule', ['BitEditorModule',
      'ClassEditorModule',
      'NewUserDialogModule',
      'SerialNumberDialogModule',
      'UsersModule',
      'PermissionModule', 'ServicesModule',
      'UtilsModule', 'ZBSyncButtonModule'])
      .directive('classInfo', function ($rootScope, perm, rpc,
        utils) {
        return {
          scope: {
            classId: '='
          },
          restrict: 'E',
          link: function ($scope) {
            $scope.isNewClass = function () {
              return $scope.classId === 1;
            };

            function getClassInfo() {
              return rpc.get_classes($scope.classId).then(function (response) {
                $scope.classInfo = response.data[$scope.classId];
                $scope.showGraduateButton = perm.isYearLeader() &&
                  $scope.classInfo &&
                  [2, 3, 4].indexOf($scope.classInfo.department_id) >= 0 &&
                  !parseInt($scope.classInfo.graduated) &&
                  ((new Date()).getFullYear() - $scope.classInfo.start_year >= 4);
                return $scope.classInfo;
              });
            }

            function getUsers() {
              return rpc.get_users(null, $scope.classId).then(function (response) {
                if (!(response.data instanceof String)) {
                  return $scope.users = response.data;
                }
              });
            }
            $scope.reload = function (classId) {
              if (!classId) return;
              utils.requestOneByOne([getClassInfo, getUsers]);
            };

            $scope.$watch('classId', function (classId) {
              $scope.reload(classId);
            });
            $scope.showNewUserDialog = function () {
              document.getElementById('new-user-dlg').open();
            };
            $scope.showEmailDialog = function () {
              var classInfo = $scope.classInfo;
              classInfo.users = angular.copy($scope.users);
              classInfo.user_count = utils.keys(classInfo.users).length;
              utils.showEmailDialog([classInfo]);
            };

            $scope.graduate = function () {
              var classInfo = $scope.classInfo;
              var departmentNames =
                ['', 'jc', 'rxl', 'jx', 'jt', 'mf', 'wl', 'nf', 'gdh', 'tc', 'yj', 'xx', 'xj'];
              var prefix = '{0}{1}.'.format(classInfo.start_year % 100,
                departmentNames[classInfo.department_id]);
              classInfo.users = utils.toList($scope.users);
              utils.forEach(classInfo.users, function (user) {
                user.newEmail = prefix + user.email;
                user.newClassId = user.classId;
              });
              utils.showConfirmGraduateDialog(classInfo);
            };
          },
          templateUrl: 'js/class_info/class_info.html?tag=201907152245'
        };
      });
  });
