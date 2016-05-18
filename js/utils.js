define('utils', [], function() {
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

  var enroll_tasks = ['welcomed', 'wechated', 'yyed', 'tested', 'bookordered'];

  return angular.module('UtilsModule', []).factory('utils', function() {
    return {
      countryLabels: window.countryData.getCountryMap(),
      us_states: {
        "AL": "Alabama",
        "AK": "Alaska",
        "AS": "American Samoa",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "DC": "District of Columbia",
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
          var intKey = parseInt(key);
          result.push(isNaN(intKey) ? key : intKey);
        }
        
        return result;
      },
      positiveKeys: function(map) {
        var result = [];
        for (var key in map) {
          if (parseInt(key) > 0) result.push(key);
        }
        
        return result;
      },
      maxKey: function(map) {
        var result = 0;
        for (var key in map) {
          var intKey = parseInt(key);
          if (intKey > result) result = intKey;
        }
        
        return result;
      },
      any: function(map, test) {
        for (var key in map) {
          if (test(map[key])) return true;
        }
        
        return false;
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
      first: function(map) {
        for (var id in map) return map[id];
      },
      isString: function(obj) {
        return obj instanceof String || typeof obj == 'string';
      },
      equalsIgnoreCase: function(str1, str2) {
        if (!str1 && !str2) return true;
        if (!str1 || !str2) return false;
        if (this.isString(str1) && this.isString(str2))
          return str1.toLowerCase() == str2.toLowerCase();
        return str1 == str2;
      },
      diff: function(orig, updated) {
        var changed = false;
        var result = {};
        for (var key in orig) {
          if ((orig[key] || updated[key]) &&
              !this.equalsIgnoreCase(orig[key], updated[key])) {
            result[key] = orig[key];
            changed = true;
          }
        }
        
        updated.oldData = result;
        updated.changed = changed;
        return changed;
      },
      removeWhere: function(list, test) {
        for (var key in list) {
          if (test(list[key])) {
            delete list[key];
          }
        }
      },
      count: function(list, test) {
        var total = 0;
        for (var key in list) {
          if (test(list[key])) ++total;
        }
        
        return total;
      },
      toList: function(map) {
        var list = [];
        for (var key in map) {
          list.push(map[key]);
        }
        
        return list;
      },
      redirect: function(url) {
        window.location.href = url;
      },
      refresh: function() {
        window.location.reload();
      },
      getWeeklyTime: function(time, week) {
        var date = time ? this.toDateTime(time) : this.getDefaultStartTime();
        date.setDate(date.getDate() + 7 * week);
        return date.toLocaleString();
      },
      toDateTime: function(unixtimestamp) {
        return new Date(unixtimestamp * 1000);
      },
      getDefaultStartTime: function() {
        var date = new Date();
        var month = date.getUTCMonth();
        
        month = month < 5 ? 5 : 11;
        date.setUTCMonth(month);
        date.setUTCDate(1);
        
        return date;
      },
      isHolidayWeek: function(startTime, week) {
        var firstHalf = new Date(startTime*1000).getMonth() == 5;
        if (firstHalf) {
          return week == 17 || week == 24;
        } else {
          return week == 3 || week == 10;
        }
      },
      classTemplate : function() {
        return {
          id: 0,
          department_id: 0,
          name: '新班级模板',
          email: '',
          class_room: '',
          teacher_id: 0,
          start_year: (new Date()).getFullYear(),
          perm_level: 0
        };
      },
      isEmpty: function(map) {
        if (map instanceof String || typeof(map) == 'string') return true;

        for (var key in map) {
          if (map[key]) return false;
        }
        
        return true;
      },
      where: function(map, test) {
        var result = {};
        for (var key in map) {
          var value = map[key];
          if (test(value)) result[key] = value;
        }
        
        return result;
      },
      unixTimestamp: function(date) {
        return date.getTime() / 1000;
      },
      makeBits: function(bits) {
        var value = 0;
        for (var index = 0;index < bits.length; index++) {
          value |= (bits[index] ? (1<<index) : 0);
        }
        return value;
      },
      isBitSet: function(bits, index) {
        return (bits & (1<<index)) != 0;
      },
      setBit: function(bits, index) {
        return bits | (1<<index);
      },
      clearBit: function(bits, index) {
        return bits & ~(1<<index);
      },
      getUSStateCode: function(state) {
        for (var code in this.us_states) {
          if (this.us_states[code] == state) return code;
        }
      },
      setCountryLabels: function(user) {
        var index = window.countryData.getCountryIndex(user.country);
        user.countryLabel = window.countryData.countries[index];
        user.state = parseInt(user.state);
        user.stateLabel =
          window.countryData.getState(index, user.state);
        if (user.country == 'US') {
          user.stateLabel = this.getUSStateCode(user.stateLabel);
        }
      },
      sexLabels: ['女', '男'],
      educationLabels: ['', '高中及以下', '大专', '本科', '硕士', '博士'],
      volunteerLabels: 
          ['', '暂时先不', '小组管理', '资料收发', '统计报数', '其他工作', '英文翻译'],
      channelLabels: ['', '其他方式', '智悲佛网', '国际佛学网',
          '美国智悲菩提讲修', '本地招生材料', '微信', '微博或论坛', '朋友介绍'],
      entranceLabels: ['本站', '微信', 'zbfw'], 

      getDisplayLabel: function(user, key) {
        return this[key+'Labels'][user[key]] || '';
      },
      getNextName: function(name) {
        var match = /([^0-9]*)([0-9]+)(.*)/.exec(name);
        if (!match) return name;
        
        return match[1] + (parseInt(match[2])+1) + match[3];
      },
      // Index of bit in the user.enroll_tasks bits.
      // Indicating whether welcome letter is sent.
      welcomeIndex: 0,
      // Indicating whether the user joined wechat group.
      wechatIndex: 1,
      // Indicating whether yy client is installed.
      yyIndex: 2,
      // Indicating whether yy client is tested.
      yyTestIndex: 3,
      // Indicating whether book order is placed (or omitted).
      bookOrderIndex: 4,
      // Indicating whether the student is in the workshop class.
      workshopIndex: 5,
      // Indicating whether the student is permanent or not.
      permanentIndex: 6
    };
  });
});
