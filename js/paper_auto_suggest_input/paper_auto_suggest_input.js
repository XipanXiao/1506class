angular.module('PaperAutoSuggestInputModule', [
  'ServicesModule'
]).directive('paperAutoSuggestInput', function(rpc) {
  return {
    scope: {
      editable: '=',
      key: '=',
      onChange: '&',
      search: '=',
      value: '=',
    },
    restrict: 'E',
    link: function(scope, element, attrs) {
      var searchTimer;
      var cacheName = attrs.label + 'Cache';
      var cache = window[cacheName] || (window[cacheName] = {});

      function update(key) {
        scope.key = key;
        scope.onChange();
      };

      function init(key) {
        if (!key) return;
        if (scope.value = cache[key]) return;

        scope.search(key).then(function(value) {
          scope.value = cache[key] = value;
        });
      }

      if (scope.key) {
        init(scope.key);
      }
      scope.$watch('key', init);

      scope.updateKeyByValue = function() {
        var value = scope.value;
        if (!value) {
          return update(0);
        }

        var key = cache[value];
        if (key) {
          return update(key);
        }

        if (searchTimer) {
          clearTimeout(searchTimer);
        }

        searchTimer = setTimeout(function() {
          searchTimer = null;            
          scope.search(value).then((results) => {
            if (!results) return;

            var hints = [];
            results.forEach(function(result) {
              cache[result.id] = result.label;
              cache[result.label] = result.id;
              hints.push(result.label);
            });
            var dataList = document.querySelector('#paper-auto-suggest-list');
            angular.element(dataList).scope().hints = hints;
          });
        }, 250);
      };
    },
    templateUrl: 'js/paper_auto_suggest_input/paper_auto_suggest_input.html?tag=20180621'
  };
});
