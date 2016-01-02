define(['services'], function() {
  return angular.module('SearchBarModule', ['ServicesModule'])
    .directive('searchBar',
        function($rootScope, rpc) {
          return {
            scope: {
              admining: '@',
            },
            link: function($scope) {
              $scope.inputChanged = function() {
                if (!$scope.value || $scope.lastInput == $scope.value) return;
                
                var lastInput = $scope.value;
                
                rpc.search($scope.value).then(function(response) {
                  if ($scope.value == lastInput) {
                    $scope.hints = response.data;
                    
                    $scope.lastInput = lastInput;
                  }
                });
              };
              
              $scope.search = function() {
                var match = /.+ <(.+)>/.exec($scope.value);
                var email = match && match[1];
                if (!email) {
                  match = /(.+) \(.+\)/.exec($scope.value);
                  email = match && match[1];
                }
                if (email) {
                  rpc.get_user(email).then(function(user) {
                    $rootScope.$broadcast('editing-user-changed', user);
                  });
                }
              };
            },
            templateUrl : 'js/search_bar/search_bar.html'
          };
        });
});
