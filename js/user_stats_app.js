define('user_stats_app', [
    'app_bar/app_bar',
    'checkbox_filter/checkbox_filter',
    'departments/departments',
    'users/users',
    'services',
    'permission',
    'utils'],
    function() {

  angular.module('AppModule', [
      'AppBarModule',
      'CheckboxFilterModule',
      'DepartmentsModule',
      'UsersModule',
      'PermissionModule',
      'ServicesModule',
      'UtilsModule',
      ])
      .directive('body', function(rpc, perm, utils) {
        return {
          link: function($scope) {
            rpc.get_user().then(function(user) {
              perm.user = user;
              if (!perm.isSysAdmin()) {
                utils.redirect('./index.html');
                return;
              }

              $scope.user = user;
            });

            $scope.classYearChanged = function() {
              $scope.users = utils.where($scope.allUsers, function(user) {
                var classYear = $scope.classes[user.classId].start_year;
                return $scope.classYears[classYear].checked;
              });
            };

            /// Initializes the [classYears] list by aggregating over all
            /// [users].
            $scope.aggregateClassYears = function() {
              var classIds = {};
              utils.forEach($scope.users, function(user) {
                classIds[user.classId] = user.classId;
              });

              return rpc.get_classes().then(function(response) {
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
                return $scope.classYears = classYears;
              });
            };

            $scope.depChanged = function(departmentId) {
              var classIds;
              
              function getClassIds() {
                return rpc.get_classes(null, departmentId)
                    .then(function(response) {
                  return classIds = utils.keys(response.data);
                });
              }
              
              $scope.users = [];
              var requests = [getClassIds];
              function collectClassUsers() {
                var requests = [];
                utils.forEach(classIds, function(classId) {
                  requests.push(function() {
                    return rpc.get_users(null, classId).then(function(response) {
                      return $scope.users = 
                          $scope.users.concat(utils.toList(response.data));
                    });
                  });
                });
                return utils.requestOneByOne(requests);
              }
              
              utils.requestOneByOne([getClassIds, collectClassUsers, 
                  $scope.aggregateClassYears]);
            };
            
            $scope.depChanged();
          }
        };
      }).config( ['$compileProvider', function( $compileProvider ) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
      }]);;

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['user_stats_app']);
