window.userInputCache = window.userInputCache || {};

define('user_input/user_input', ['services', 'utils'], function() {
  var users = window.userInputCache;
  
  return angular.module('UserInputModule', ['ServicesModule', 'UtilsModule'])
	.directive('userTypeAhead', function(rpc) {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function(scope, element, attrs, ngModel) {
        var searchTimer;

        ngModel.$formatters.push(function(userId) {
          return users[userId];
        });
        ngModel.$parsers.push(function(userLabel) {
          if (!userLabel) {
            scope.$parent.update(0);
            return 0;
          }

          var userId = users[userLabel];
          if (userId) {
            scope.$parent.update(userId);
            return userId;
          }

          if (searchTimer) {
            clearTimeout(searchTimer);
          }

          searchTimer = setTimeout(function() {
            searchTimer = null;            
            rpc.searchByName(userLabel).then(function(response) {
              if (!response.data) return;

              var hints = [];
              response.data.forEach(function(user) {
                var label = user.nickname ? 
                    '{0}({1})'.format(user.name, user.nickname) : user.name;
                label += user.email ? ('-' + user.email) : '';
                users[user.id] = label;
                users[label] = user.id;
                hints.push(user.id);
              });
              scope.$parent.hints = hints;
            });
          }, 1000);
        });
      }
    };
  }).directive('userInput', function(rpc, utils) {
  	return {
  	  scope: {
        editing: '@',
        onChange: '&',
        userId: '=',
        hints: '='
  	  },
  	  link: function(scope, elements, attrs) {
  	    scope.editor = {editing: scope.editing};
        scope.users = users;

  	    function init(userId) {
  	      if (!userId) return;

  	      if (users[userId]) return;

  	      rpc.getUserLabel(userId).then(function(response) {
  	        users[userId] = response.data.label;
  	      });
  	    }
  	    if (scope.userId) {
  	      init(scope.userId);
  	    }
        scope.$watch('userId', init);
        scope.$watch('hints', function(hints) {
          if (!hints) return;
          if (!(hints instanceof Array)) {
            hints = utils.positiveKeys(hints);
          }
          var dataList = document.querySelector('#user-input-hints');
          var dataListScope = angular.element(dataList).scope();
          dataListScope.hints = hints;
          dataListScope.users = users;
        });
  
  	    scope.keyPressed = function(event) {
  	      if (event.keyCode == 13 || event.keyCode == 27) {
  	        scope.editor.editing = false;
  	        event.preventDefault();
  	      }
        };
        
        scope.edit = () => {
          if (attrs.disabled) return;
          scope.editor.editing = true
        };

        scope.update = (userId) => {
          scope.userId = userId;
          scope.onChange();
        };
  	  },
  		templateUrl : 'js/user_input/user_input.html?tag=20181013'
  	};
  });
});
