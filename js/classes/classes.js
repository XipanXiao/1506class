define(['services', 'utils'], function() {
  return angular.module('ClassesModule', ['ServicesModule', 'UtilsModule'])
    .controller('ClassesController', function($scope, $rootScope, rpc, utils) {
        rpc.get_classes().then(function(response) {
          $scope.alumnis = utils.groupBy(response.data, 'start_year');
          $scope.years = utils.keys($scope.alumnis).map(parseInt); 
          
          $scope.yearChanged = function() {
            $scope.classes = $scope.alumnis[$scope.year];
          };

          $scope.year = (new Date()).getFullYear();
          $scope.yearChanged();
          
          $scope.selected = function (id) {
            $scope.selectedId = id;
            $rootScope.$broadcast('class-selected', $scope.classes[id]);
          };

          $scope.selectUserClass();
        });

        $scope.selectUserClass = function(classId) {
          if (!$scope.selected || !$scope.classId) return;
          $scope.selected($scope.classId);
        }

        $scope.$on('user-loaded', function(event, user) {
          $scope.classId = user.classId;
          $scope.selectUserClass();
        });
      })
    .directive('classes', function() {
      return {
        link: function(scope, element, attributes) {
            scope.listType = attributes["listType"];
            scope.classSelected = attributes['classSelected'];
        },
        templateUrl : 'js/classes/classes.html'
      };
    });
});
