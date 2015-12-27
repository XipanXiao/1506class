define(function() {
  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number]
            : match;
      });
    };
  }

  if (!Array.prototype.map) {
    Array.prototype.map = function(callback) {
      var result = [];
      for (var idx in this) {
        result[idx] = callback(this[idx]);
      }
      
      return result;
    };
  }

  return angular.module('UtilsModule', []).factory('utils', function() {
    return {
      keys: function(map) {
        var result = [];
        for (var key in map) {
          result.push(key);
        }
        
        return result;
      },
      map: function(arr, callback) {
        var result = [];
        for (var key in arr) {
          result.push(callback(arr[key]));
        }
        
        return result;
      },
      groupBy: function(arr, key) {
        var groups = {};
        for (var idx in arr) {
          var item = arr[idx];
          var value = item[key];
          var group = groups[value];
          if (!group) {
            group = groups[value] = {};
          }
          
          group[idx] = item;
        }
        
        return groups;
      }
    };
  });
});
