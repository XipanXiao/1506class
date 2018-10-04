define('local_app', [
    'app_bar/app_bar',
    'address_filter/address_filter',
    'checkbox_filter/checkbox_filter',
    'users/users',
    'services',
    'permission',
    'utils'],
    function() {

  angular.module('AppModule', [
      'AppBarModule',
      'AddressFilterModule',
      'CheckboxFilterModule',
      'UsersModule',
      'PermissionModule',
      'ServicesModule',
      'UtilsModule',
      ])
      .directive('body', function(rpc, perm, utils) {
        return {
          link: function($scope) {
            $scope.roleOptions = [
              {label: '退出', checked: false, department_id: 9},
              {label: '功德会', checked: false, department_id: 8},
              {label: '学会', checked: true}
            ];
            const isRegular = (user) => {
              var depId = parseInt($scope.classes[user.classId].department_id);
              for (let role of $scope.roleOptions) {
                if (role.department_id == depId || !role.department_id) {
                  return role.checked;
                }
              }
            };
            const isInYears = (user) => {
              var classYear = $scope.classes[user.classId].start_year;
              return $scope.classYears[classYear].checked;
            };
      
            rpc.get_user().then(function(user) {
              perm.user = user;
              if (!perm.isSysAdmin()) {
                utils.redirect('./index.html');
                return;
              }

              $scope.user = user;
            });
            $scope.$on('users-selected', function(event, users) {
              $scope.allUsers = users;
              $scope.aggregateClassYears();
            });
            $scope.classYearChanged = function() {
              $scope.users = utils.where($scope.allUsers, function(user) {
                return isInYears(user) && isRegular(user);
              });
            };

            /// Initializes the [classYears] list by aggregating over all
            /// [users].
            $scope.aggregateClassYears = function() {
              var classIds = {};
              utils.forEach($scope.allUsers, function(user) {
                classIds[user.classId] = user.classId;
              });

              rpc.get_classes().then(function(response) {
                var classYears = {};
                utils.forEach(classIds, function(classId) {
                  $scope.classes = response.data;
                  var start_year = response.data[classId].start_year;
                  if (classYears[start_year]) return;
                  classYears[start_year] = {
                    label: start_year,
                    checked: true
                  };
                });
                $scope.classYears = classYears;
                $scope.users = utils.where($scope.allUsers, isRegular);
              });
            };
          }
        };
      }).config( ['$compileProvider', function( $compileProvider ) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
      }]);;

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['local_app']);
