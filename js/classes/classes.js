define('classes/classes', ['importers', 'import_dialog/import_dialog',
    'permission', 'services', 'utils'], function() {
  return angular.module('ClassesModule', ['ImportDialogModule',
      'PermissionModule', 'ServicesModule', 'UtilsModule'])
    .directive('classes', function($rootScope, importers, perm, rpc, utils) {
      return {
        scope: {
          classId: '=',
          listType: '@',
          permission: '@'
        },
        link: function($scope) {
          $scope.reload = function() {
            rpc.get_classes().then(function(response) {
              $scope.showImportDialog = false;
              var classes = utils.where(response.data, function(info) {
                return perm.canWrite(info);
              });
              $scope.alumnis = utils.groupBy(classes, 'start_year');
              $scope.years =
                  utils.map(utils.positiveKeys($scope.alumnis), parseInt);
  
              $scope.currentClass = {
                  year: $scope.classId ?
                      parseInt(classes[$scope.classId].start_year) :
                          (new Date()).getFullYear(),
                  id: $scope.classId
              };
              
              $scope.yearChanged = function() {
                $scope.classes = $scope.alumnis[$scope.currentClass.year];
                $scope.classes[1] = response.data[1];
                $scope.classIds = utils.map(utils.keys($scope.classes), parseInt);
              };
  
              $scope.yearChanged();
            });
          };
          
          $scope.reload();

          $scope.select = function (id) {
            var classInfo = $scope.classes[id];
            if (!perm.canRead(classInfo)) {
              alert('Permission denied');
              return;
            }
            
            $scope.lastClassId = $scope.classId;
            $scope.classId = id;
            $scope.currentClass.id = id;
          };
          
          $scope.locateClass = function (classInfo) {
            $scope.currentClass.year = classInfo.start_year;
            $scope.yearChanged();
            $scope.select(classInfo.id);
          };
          
          $scope.$on('editing-user-changed', function(event, editingUser) {
            if (!editingUser) return;
            if (editingUser.classId != $scope.classId ) {
              $scope.locateClass(editingUser.classInfo);
            }
          });
          
          $scope.$on('class-updated', function(event, classId) {
            $scope.classId = classId;
            $scope.reload();
          });

          $scope.$on('class-deleted', function(event, classId) {
            if ($scope.classId == classId) {
              $scope.classId = $scope.lastClassId;
            }
            $scope.reload();
          });
          
          $scope.createNewClass = function() {
            $scope.classes[0] = utils.classTemplate();
            $scope.select(0);
            $rootScope.$broadcast('select-page', 0);
          };
          
          $scope.exportUsers = function() {
            importers['userImporter'].exportAll().then(function(result) {
              $scope.usersSqlUrl = result.sql;  
              $scope.usersTsvUrl = result.tsv;  
            });
          };
          
          $scope.isSysAdmin = function() {
            return perm.isSysAdmin();
          }
        },
        templateUrl : 'js/classes/classes.html'
      };
    });
});
