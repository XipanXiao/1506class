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

            $scope.filterUsers = () => {
              $scope.users = utils.where($scope.allUsers, function(user) {
                var years = $scope.classYears;
                var classInfo = classes[user.classId];
                var district = $scope.districts[parseInt(user.district)];
                return district.checked &&
                    (!years || years[classInfo.start_year].checked) &&
                    $scope.departments[classInfo.department_id].checked;
              });
              return utils.truePromise();
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
                  // dep 8 = gongde hui.
                  // dep 9 have all quit people.
                  dep.checked = dep.id != 9 && dep.id != 8;
                });
                return $scope.departments;
              });
            }

            function getDistricts() {
              return rpc.get_districts().then((response) => {
                $scope.districts = {};
                utils.forEach(response.data, (district) => {
                  district.label = district.name;
                  district.checked = true;
                  $scope.districts[parseInt(district.id)] = district;
                });
                $scope.districts[0] = {label: '未指定地区', checked: true};
                return $scope.districts;
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
                      $scope.allUsers = 
                          $scope.allUsers.concat(utils.toList(response.data));
                      $scope.filterUsers();
                      return $scope.allUsers.length;
                    });
                  });
                });
                return utils.requestOneByOne(requests);
              }
              
              utils.requestOneByOne([getDepartments, getDistricts, getClassIds,
                  collectClassUsers, aggregateClassYears, $scope.filterUsers]);
            };
            
            $scope.fixCityNames = function() {
              var requests = [];
              utils.forEach($scope.users, function(user) {
                if (!user.zip || (user.city && /^\w+$/.test(user.city))) return;
                var request = function() {
                  return rpc.lookup(user.zip).then(function(results) {
                    if (!results) return true;

                    var address = 
                        window.countryData.fromGoogleResults(user.zip, results);            
                    if (user.country == address.countryCode &&
                        user.state == address.stateIndex &&
                        user.city != address.city) {
                      return rpc.update_user({id: user.id, 
                          city: address.city}).then(function(response) {
                        if (response.data.updated) {
                          console.log('{0} city is changed from {1} to {2}'.
                              format(user.name, user.city, address.city));
                          user.city = address.city;
                        }
                        return true;
                      });
                    }
                    return true;
                  });
                };
                requests.push(request);
              });
              utils.requestOneByOne(requests);
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
