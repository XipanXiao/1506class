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
            
            $scope.yearChanged = function() {
              $scope.classes = $scope.alumnis[$scope.year];
              $scope.selectClass();
            };

            $scope.year = (new Date()).getFullYear();
            $scope.yearChanged();
          });

          $scope.selected = function (classInfo) {
            $scope.classId = classInfo.id;
            $scope.selectedClass = classInfo;
            $rootScope.$broadcast('class-selected', classInfo);
          };

          $scope.selectClass = function() {
            if (!$scope.classes || !$scope.classId) return;
            $scope.selected($scope.classes[$scope.classId]);
          };

          if (!$scope.classId) {
            $scope.$on('user-loaded', function(event, user) {
              $scope.classId = user.classId;
              $scope.selectClass();
            });
          }
        },
        templateUrl : 'js/classes/classes.html'
      };
    });
});
