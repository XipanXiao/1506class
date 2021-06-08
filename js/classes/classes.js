define('classes/classes', ['importers', 'import_dialog/import_dialog',
    'permission', 'services', 'utils'], function() {
  return angular.module('ClassesModule', ['ImportDialogModule',
      'PermissionModule', 'ServicesModule', 'UtilsModule'])
    .directive('classes', function($rootScope, importers, perm, rpc, utils) {
      return {
        scope: {
          classId: '=',
          listType: '@'
        },
        link: function($scope) {
          $scope.currentClass = {};

          $scope.initUser = function() {
            return rpc.get_user().then(function(user) {
              return perm.user = user;
            });
          };

          $scope.yearChanged = function() {
            if (!$scope.alumnis) return;

            $scope.classes = $scope.alumnis[$scope.currentClass.year];

            // Classes without a 'start_year' field are pinned for all years.
            for (var id in window.classInfos) {
              var info = window.classInfos[id];
              if (!info.start_year) { $scope.classes[id] = info; }
            }

            $scope.classIds = utils.map(utils.keys($scope.classes), parseInt);
          };

          $scope.reload = function() {
            return rpc.get_classes().then(function(response) {
              $scope.showImportDialog = false;
              var classes = response.data;
              if (utils.isEmpty(classes)) return;

              $scope.alumnis = utils.groupBy(classes, 'start_year');
              $scope.years =
                  utils.map(utils.positiveKeys($scope.alumnis), parseInt);
              var classInfo = classes[$scope.classId] || utils.first(classes);
              $scope.classId = classInfo.id;
  
              $scope.currentClass = {
                  year: parseInt(classInfo.start_year),
                  id: $scope.classId
              };
  
              $scope.yearChanged();
              return true;
            });
          };
          
          utils.requestOneByOne([$scope.initUser, $scope.reload]);

          $scope.select = function (id) {
            $scope.lastClassId = $scope.classId;
            $scope.classId = id;
            $scope.currentClass.id = id;
          };

          $scope.$watch("classId", function(classId) {
            if (!classId) return;
            $scope.currentClass.id = classId;
            var classInfo = window.classInfos[classId];
            if (classInfo) {
              $scope.currentClass.year = classInfo.start_year;
              $scope.yearChanged();
            }
          });
          
          $scope.locateClass = function (classInfo) {
            $scope.currentClass.year = classInfo.start_year;
            $scope.yearChanged();
            $scope.select(classInfo.id);
          };
          
          $scope.$on('editing-user-changed', function(event, editingUser) {
            if (!editingUser) {
              return;
            }
            if (editingUser.classId !== $scope.classId ) {
              $scope.locateClass(editingUser.classInfo);
            }
          });
          
          $scope.$on('class-updated', function(event, classId) {
            $scope.classId = classId;
            $scope.reload();
          });

          $scope.$on('class-deleted', function(event, classId) {
            if ($scope.classId === classId) {
              $scope.classId = $scope.lastClassId;
            }
            $scope.reload();
          });
          
          $scope.$on("include-deleted", function(event, includeDeleted) {
            $scope.includeDeleted = includeDeleted;
          });

          $scope.createNewClass = function() {
            $scope.classes[0] = utils.classTemplate();
            $scope.select(0);
            $rootScope.$broadcast('select-page', 0);
          };
          
          $scope.isSysAdmin = function() {
            return perm.isSysAdmin();
          };
          $scope.isYearLeader = function() {
            return perm.isYearLeader();
          };

          $scope.showEmailDialog = function() {
        	    const isNotQuit = (classInfo) => classInfo.department_id != 9;
        	    var classes = utils.where($scope.classes, isNotQuit);
        	    utils.showEmailDialog(utils.toList(classes));
          };
          
          $scope.exportUsers = function() {
            importers.userImporter.exportUsers($scope.classIds,
                $scope.exportedUrl).then(function(url) {
                  $scope.exportedUrl = url;
                });
          };
        },
        templateUrl : 'js/classes/classes.html?tag=2021'
      };
    });
});
