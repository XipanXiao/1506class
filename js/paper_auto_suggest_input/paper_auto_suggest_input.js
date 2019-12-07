angular.module('PaperAutoSuggestInputModule', [
  'PaperBindingsModule',
  'UtilsModule'
]).directive('paperAutoSuggestInput', function(utils) {
  return {
    scope: {
      editable: '=',
      hints: '=',
      key: '=',
      label: '@',
      onChange: '&',
      search: '=',
      value: '=',
    },
    restrict: 'E',
    link: function(scope) {
      var searchTimer;
      var cacheName = scope.label + 'Cache';
      var cache = window[cacheName] || (window[cacheName] = {});

      function update(key) {
        if (scope.key == key) return;
        scope.key = key;
        scope.onChange({'key': key, 'value': scope.value});
      };

      function init(key) {
        if (!parseInt(key)) return;
        if (scope.value = cache[key]) return;

        scope.search(key, true).then(function(value) {
          if (value) {
            scope.value = cache[key] = value;
          } else {
            scope.key = null;
          }
        });
      }

      if (scope.key) {
        init(scope.key);
      }
      scope.$watch('key', init);
      scope.$watch('hints', setSuggestions);

      function setSuggestions(suggestions) {
        if (!suggestions) return;
        var id = '{0}-suggestions'.format(scope.label);
        var dataList = document.querySelector('#' + id) ||
            document.createElement('datalist');
        dataList.id = dataList.id || id;

        var parent = dataList.parentElement;
        parent && parent.removeChild(dataList);

        while(dataList.options.length < suggestions.length) {
          dataList.appendChild(document.createElement('option'));
        }
        var options = dataList.options;
        while(options.length > suggestions.length) {
          dataList.removeChild(options[options.length - 1]);
        }
        for (var index = 0; index < suggestions.length; index++) {
          options[index].value = suggestions[index];
        }
        (parent || document.body).appendChild(dataList);
      }

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
            utils.forEach(results, function(result) {
              cache[result.id] = result.label;
              cache[result.label] = result.id;
              hints.push(result.label);
            });
            setSuggestions(Array.from(new Set(hints)));
          });
        }, 250);
      };
    },
    templateUrl: 'js/paper_auto_suggest_input/paper_auto_suggest_input.html?tag=20190621'
  };
});
