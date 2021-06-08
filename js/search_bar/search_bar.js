define('search_bar/search_bar', ['services'], function() {

  var extractEmail = function(value) {
    return value.split('-')[1];
  };
  return angular.module('SearchBarModule', 
      ['PaperAutoSuggestInputModule', 'ServicesModule'])
    .directive('searchBar',
        function($rootScope, rpc) {
          return {
            link: function(scope) {
              scope.searchUser = function(query) {
                return rpc.searchUser(query, scope.includeDeleted);
              };

              scope.toggleIncludeDeleted = function() {
                $rootScope.$broadcast('include-deleted', scope.includeDeleted);
              };

              scope.search = function(id, label) {
                var email = extractEmail(label);
                if (email) {
                  rpc.get_user(email).then(function(user) {
                    $rootScope.$broadcast('editing-user-changed', user);
                  });
                }
              };
            },
            templateUrl : 'js/search_bar/search_bar.html?tag=2021'
          };
        });
});
