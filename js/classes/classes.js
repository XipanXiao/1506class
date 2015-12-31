define(['services', 'utils'], function() {
  return angular.module('ClassesModule', ['ServicesModule', 'UtilsModule'])
    .directive('classes', function($rootScope, rpc, utils) {
      return {
        scope: {
          classId: '=',
          listType: '@'
        },
        link: function($scope, attributes) {
          rpc.get_classes().then(function(response) {
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

          $scope.select = function (id) {
            $scope.classId = id;
            $scope.currentClass.id = id;
          };
        },
        templateUrl : 'js/classes/classes.html'
      };
    });
});
