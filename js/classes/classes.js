define(['import_dialog/import_dialog', 'permission', 'services', 'utils'],
    function() {
  return angular.module('ClassesModule', ['ImportDialogModule',
      'PermissionModule', 'ServicesModule', 'UtilsModule'])
    .directive('classes', function(perm, rpc, utils) {
      return {
        scope: {
          classId: '=',
          listType: '@'
        },
        link: function($scope) {
          $scope.reload = function() {
            rpc.get_classes().then(function(response) {
              $scope.showImportDialog = false;
              $scope.alumnis = utils.groupBy(response.data, 'start_year');
              $scope.years = utils.map(utils.keys($scope.alumnis), parseInt);
  
              $scope.currentClass = {
                  year: $scope.classId ?
                      parseInt(response.data[$scope.classId].start_year) :
                          (new Date()).getFullYear(),
                  id: $scope.classId
              };
              
              $scope.yearChanged = function() {
                $scope.classes = $scope.alumnis[$scope.currentClass.year];
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
          
          $scope.$on('class-added', function(event, classId) {
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
          };
        },
        templateUrl : 'js/classes/classes.html'
      };
    });
});
