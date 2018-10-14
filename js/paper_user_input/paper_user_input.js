angular.module('PaperUserInputModule', [
  'ServicesModule'
]).directive('paperUserInput', function(rpc) {
  var users = {};
  return {
    scope: {
      userId: '=',
      onChange: '&',
    },
    restrict: 'E',
    link: function(scope) {
      var searchTimer;

      scope.users = users;

      function update(id) {
        scope.userId = id;
        scope.onChange();
      };

      function init(userId) {
        if (!userId) return;
        if (scope.name = users[userId]) return;

        rpc.getUserLabel(userId).then(function(response) {
          scope.name = users[userId] = response.data.label;
        });
      }

      if (scope.userId) {
        init(scope.userId);
      }
      scope.$watch('userId', init);

      scope.search = function() {
        var userLabel = scope.name;
        if (!userLabel) {
          return update(0);
        }

        var userId = users[userLabel];
        if (userId) {
          return update(userId);
        }

        if (searchTimer) {
          clearTimeout(searchTimer);
        }

        searchTimer = setTimeout(() => {
          searchTimer = null;            
          rpc.searchByName(userLabel).then((response) => {
            if (!response.data) return;

            scope.hints = [];
            response.data.forEach(function(user) {
              var label = user.nickname ? 
                  '{0}({1})'.format(user.name, user.nickname) : user.name;
              label += '-' + user.email;
              users[user.id] = label;
              users[label] = user.id;
              scope.hints.push(user);
            });
          });
        }, 1000);
      };
    },
    templateUrl: 'js/paper_user_input/paper_user_input.html?tag=20180621'
  };
});
