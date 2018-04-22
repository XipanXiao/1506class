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

            function filterUsers() {
              $scope.users = utils.where($scope.allUsers, function(user) {
                var classInfo = classes[user.classId];
                return $scope.classYears[classInfo.start_year].checked &&
                    $scope.departments[classInfo.department_id].checked;
              });
              return utils.truePromise();
            }
            $scope.classYearChanged = function() {
              filterUsers();
            };
            
            $scope.depChanged = function() {
              filterUsers();
            };

            var classes;
            /// Initializes the [classYears] list by aggregating over all
            /// [users].
            function aggregateClassYears() {
              var classIds = {};
              utils.forEach($scope.allUsers, function(user) {
                classIds[user.classId] = user.classId;
              });

              var classYears = {};
              utils.forEach(classIds, function(classId) {
                var start_year = classes[classId].start_year;
                if (classYears[start_year]) return;
                classYears[start_year] = {
                  label: start_year,
                  checked: true
                };
              });
              $scope.classYears = classYears;
              return utils.truePromise();
            };
            
            function getDepartments() {
              return rpc.get_departments().then(function(response) {
                $scope.departments = response.data;
                utils.forEach($scope.departments, function(dep) {
                  dep.label = dep.name;
                  dep.checked = dep.id != 9;// dep 9 have all quit people.
                });
                return $scope.departments;
              });
            }

            function loadAllUsers() {              
              function getClassIds() {
                return rpc.get_classes().then(function(response) {
                  return classes = response.data;
                });
              }
              
              $scope.allUsers = [];
              var requests = [getClassIds];
              function collectClassUsers() {
                var requests = [];
                utils.forEach(classes, function(classInfo) {
                  requests.push(function() {
                    return rpc.get_users(null, classInfo.id).then(function(response) {
                      return $scope.users = $scope.allUsers = 
                          $scope.allUsers.concat(utils.toList(response.data));
                    });
                  });
                });
                return utils.requestOneByOne(requests);
              }
              
              utils.requestOneByOne([getClassIds, collectClassUsers, 
                  getDepartments, aggregateClassYears, filterUsers]);
            };
            
            loadAllUsers();
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
