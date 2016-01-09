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
      stateMap: {
        "AL": "Alabama",
        "AK": "Alaska",
        "AS": "American Samoa",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "DC": "District Of Columbia",
        "FM": "Federated States Of Micronesia",
        "FL": "Florida",
        "GA": "Georgia",
        "GU": "Guam",
        "HI": "Hawaii",
        "ID": "Idaho",
        "IL": "Illinois",
        "IN": "Indiana",
        "IA": "Iowa",
        "KS": "Kansas",
        "KY": "Kentucky",
        "LA": "Louisiana",
        "ME": "Maine",
        "MH": "Marshall Islands",
        "MD": "Maryland",
        "MA": "Massachusetts",
        "MI": "Michigan",
        "MN": "Minnesota",
        "MS": "Mississippi",
        "MO": "Missouri",
        "MT": "Montana",
        "NE": "Nebraska",
        "NV": "Nevada",
        "NH": "New Hampshire",
        "NJ": "New Jersey",
        "NM": "New Mexico",
        "NY": "New York",
        "NC": "North Carolina",
        "ND": "North Dakota",
        "MP": "Northern Mariana Islands",
        "OH": "Ohio",
        "OK": "Oklahoma",
        "OR": "Oregon",
        "PW": "Palau",
        "PA": "Pennsylvania",
        "PR": "Puerto Rico",
        "RI": "Rhode Island",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "TN": "Tennessee",
        "TX": "Texas",
        "UT": "Utah",
        "VT": "Vermont",
        "VI": "Virgin Islands",
        "VA": "Virginia",
        "WA": "Washington",
        "WV": "West Virginia",
        "WI": "Wisconsin",
        "WY": "Wyoming"
      },
      
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
      },
      firstElement: function(arr, key, value) {
        for (var idx in arr) {
          if (arr[idx][key] == value) return arr[idx];
        }
        
        return null;
      },
      diff: function(orig, updated) {
        var changed = false;
        var result = {};
        for (var key in orig) {
          if ((orig[key] || updated[key]) && orig[key] != updated[key]) {
            result[key] = orig[key];
            changed = true;
          }
        }
        
        updated.oldData = result;
        return updated.changed = changed;
      }
    };
  });
});
