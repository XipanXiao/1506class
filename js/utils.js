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
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(suffix) {
      return this.indexOf(suffix) == 0;
    };
  }
  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(suffix) {
      return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
  }
  if (!String.prototype.replaceAll) {
	String.prototype.replaceAll = function(search, replacement) {
	  var target = this;
	  return target.replace(new RegExp(search, 'g'), replacement);
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

  if (!Array.prototype.filter) {
    Array.prototype.filter = function(callback) {
      var result = [];
      for (var idx in this) {
        if(callback(this[idx])) {
          result.push(this[idx]);
        }
      }
      
      return result;
    };
  }

  function parseMoney(value) {
    return value && parseFloat(value) || 0.00;
  }

  return angular.module('UtilsModule', []).factory('utils', function($q) {
    var utils = {
      countryLabels: window.countryData && window.countryData.getCountryMap(),
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
      values: function(map) {
        var result = [];
        for (var key in map) {
          result.push(map[key]);
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
      forEach: function(map, callback) {
        for (var key in map) {
          callback(map[key]);
        }
      },
      fold: function(map, callback, init) {
        var combined = init;
        for (var key in map) {
          combined = callback(map[key], combined);
        }
        return combined;
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
      last: function(map) {
        var value;
        for (var id in map) value = map[id];
        return value;
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
      mix_in: function(dst, src) {
        for (var key in src) {
          dst[key] = src[key];
        }
        return dst;
      },
      toList: function(map) {
        var list = [];
        for (var key in map) {
          list.push(map[key]);
        }
        
        return list;
      },
      toMap: function(list, key) {
        var m = {};
        key = key || 'id';
        utils.forEach(list, function(item) {
          m[item[key]] = item;
        });
        return m;
      },
      redirect: function(url) {
        window.location.href = url;
      },
      getBaseUrl: function() {
        var index = location.pathname.lastIndexOf('/') + 1;
        var filename = location.pathname.substr(index);
        return location.href.substr(0, location.href.indexOf(filename));
      },
      login: function() {
        var index = location.pathname.lastIndexOf('/') + 1;
        var filename = location.pathname.substr(index);
        if (!filename) {
          index = location.pathname.lastIndexOf('/', index - 2) + 1;
          filename = location.pathname.substr(index);
        }
        location.href = 'login.html?redirect=' + filename +
            encodeURIComponent(location.search) + '&tag=20181023';
      },
      refresh: function() {
        window.location.reload();
      },
      getWeeklyTime: function(time, week) {
        var date = time ? this.toDateTime(time) : this.getDefaultStartTime();
        date.setDate(date.getDate() + 7 * week);
        function fullDigits(d) {
          return (d < 10 ? '0' : '') + d;
        }
        return '{0}/{1}/{2}'.format(
            fullDigits(date.getMonth() + 1),
            fullDigits(date.getDate()),
            date.getFullYear());
      },
      toDateTime: function(unixtimestamp) {
        return new Date(unixtimestamp * 1000);
      },
      isDst: function() {
        var date = new Date();
        function stdTimezoneOffset() {
          var jan = new Date(date.getFullYear(), 0, 1);
          var jul = new Date(date.getFullYear(), 6, 1);
          return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
        }
        return date.getTimezoneOffset() < stdTimezoneOffset();
      },
      /// Output [time] string in EST to local time string.
      formatTime: function(timeString) {
        // A time in EST.
        var date = new Date('1970-01-01T' + timeString + 'Z');
        // Time in UTC.
        var zone = utils.isDst() ? 4 : 5;
        date.setTime(date.getTime() + zone * 60 * 60 * 1000);

        // Time string in local.
        var options = {timeZoneName: 'short', 
            hour: '2-digit', minute: '2-digit'};
        return date.toLocaleTimeString('en-US', options);
      },
      getDefaultStartTime: function() {
        var date = new Date();
        var month = date.getUTCMonth();
        
        month = month < 5 ? 5 : 11;
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCDate(2);
        date.setUTCMonth(month);
        
        return date;
      },
      /// Returns the date after 7*26 days of the start time.
      getEndTime: function(scheduleGroup) {
        var startDate = this.toDateTime(scheduleGroup.start_time);
        var endTerm = new Date(startDate.getTime());
        var scheduleIds = this.keys(scheduleGroup.schedules);
        var weeks = scheduleIds.length - 1;
        // Trim ending holidays.
        for (var index = weeks; index >= 0; index--) {
          var schedule = scheduleGroup.schedules[scheduleIds[index]];
          if (!utils.vacation(schedule)) break; 
          weeks--;
        }
        endTerm.setDate(startDate.getDate() + 7 * weeks + 1);
        return utils.unixTimestamp(endTerm);
      },
      /// Given a date like 2015-12-05 18:00:00, returns 2015-12-01 00:00:00,
      /// a date like 05-28, returns 06-01.
      roundToDefaultStartTime: function(unixtimestamp) {
        var date = this.toDateTime(unixtimestamp);

        var month = date.getUTCMonth();
        month = Math.abs(month - 5) <= 2 ? 5 : 11;
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCDate(2);
        date.setUTCMonth(month);
        
        return this.unixTimestamp(date);
      },
      toEST: function(date) {
          var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
          var diff = utils.isDst() ? 4 : 5;
          return new Date(utc - (3600000 * diff));
      },
      fromMysqlTime: function(time_string) {
        var t = time_string.split(/[- :]/);
        return new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));        
      },
      nextTerm: function(date, direction) {
        var next = new Date(date.getTime());
        next.setUTCMonth(date.getUTCMonth() + direction * 6);
        return next;
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
          perm_level: 2
        };
      },
      isEmptyObject: function(map) {
        for (var key in map) {
          if (key) return false;
        }
        return true;
      },
      isEmpty: function(map) {
        if (!map || map instanceof String || typeof(map) == 'string') {
          return true;
        }

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
        return Math.floor(date.getTime() / 1000);
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
      examLabels: ['无', '闭卷', '开卷'],
      volunteerLabels: 
          ['暂时先不', '小组管理', '资料收发', '统计报数', '其他工作', '英文翻译',
           '提供场所'],
      channelLabels: ['其他方式', '智悲佛网', '国际佛学网',
          '美国佛学会地方组活动', '报纸杂志传单招生广告', '微信公众号', '微博或论坛',
          '朋友介绍', 'Google搜索', '微信群', '微信朋友圈', 
          '知乎', '豆瓣', 'Facebook'],
      entranceLabels: ['本站', '微信', 'zbfw'], 
      weekDayLabels: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      staffTitleLabels: ['', '常务理事', '部门理事', '部门干事'],
      getDisplayLabel: function(user, key) {
        return this[key+'Labels'][user[key]] || '';
      },
      getClassLabel: function(classInfo) {
        return (classInfo.name || '') + (classInfo.time || '').replace(/:00$/, '');
      },
      getNextName: function(name) {
        var match = /([^0-9]*)([0-9]+)(.*)/.exec(name);
        if (!match) return name;
        
        return match[1] + (parseInt(match[2])+1) + match[3];
      },
      formatDate: function(dateString) {
        var parts = dateString.split('-');
        return parts[0] + '年' + (parseInt(parts[1])||1) + '月' + 
            (parseInt(parts[2])||1) + '日';
      },
      futureValue: function(value) {
        return $q(function(resolve) {
          resolve(value);
        });
      },
      truePromise: function() {
        return utils.futureValue(true);
      }, 
      /// Calls the first asynchronous function from the list of [requests], 
      /// then calls the next one once it's done, and so on. The chain
      /// terminates after all promises resolve with a true value, or any of
      /// of them fails (resolves with a false value).
      ///
      /// Returns a promise that is resolved after the last request is done.
      requestOneByOne: function(requests) {
        var index = 0;
        var that = this;
        var onError = function() {
          return false;
        };
        var next = function(previousResponse) {
          if (!previousResponse) {
            return false;
          }
          var fn = requests[index++];
          // Always return a promise so that 'then' is called even [requests]
          // is empty.
          return fn ? fn().then(next, onError) :
                utils.futureValue(previousResponse);
        };
        return next(true);
      },
      validateTaskInput: function(task, data) {
        if (task.duration && task.sub_tasks) {
          if (data.duration < data.count * 30) {
            alert('每次观修时间不少于30分钟，{0}次一共至少要{1}分钟'.format(
                data.count, data.count * 30));
            return false;
          } else if (data.duration > data.count * 180) {
            alert('观修{0}次一共{1}分钟，是不是太夸张了？'.format(
                data.count, data.duration));
            return false;
          }
        }
        if (task.lastRecord && data.count == task.lastRecord.count &&
            this.unixTimestamp(new Date()) - task.lastRecord.ts < 10) {
          alert('刚提交过一模一样的报数，请勿重复提交');
          return false;
        }
        return true;
      },
      /// Given a schedule group, calculates the unix timestamp of the middle
      /// of its term.
      getMidTerm: function(scheduleGroup) {
        var startDate = this.toDateTime(scheduleGroup.start_time);
        var midTerm = new Date(startDate.getTime());
        var weeks = parseInt(scheduleGroup.mid_week) || 12;
        midTerm.setDate(startDate.getDate() + 7 * weeks);
        return this.unixTimestamp(midTerm);
      },
      /// Returns the half_term a schedule identfied by [index]
      /// belongs to.
      getHalfTerm: function(scheduleGroup, index, limited) {
        var half_term = scheduleGroup.term * 2;

        if (limited) {
          var length = utils.keys(scheduleGroup.limited_courses).length;
          var firstHalf = index <= (length / 2);
          return firstHalf ? half_term : half_term + 1;
        }
        var counter = 0;
        var schedules = scheduleGroup.schedules;
        for (var id in schedules) {
          var schedule = schedules[id];
          if (schedule.middle) return half_term + (index > counter ? 1 : 0);
          counter++;
        }
        return half_term;
      },
      getHalfTerms: function(scheduleGroup) {
        var now = utils.unixTimestamp(new Date());
        var midTerm = utils.getMidTerm(scheduleGroup);

        // Before middle of the current term, nothing to report yet.
        if (now < midTerm) return [];

        var endTerm = utils.getEndTime(scheduleGroup);
        
        var half_term_base = scheduleGroup.term * 2;
        // Between mid-term and the end of the term, report the first half.
        if (midTerm <= now && now < endTerm) {
          return [half_term_base];
        }
        
        // Report both the first and the second half terms.
        return [half_term_base, half_term_base + 1];
      },
      /// Returns true if [schedule] has no classes.
      vacation: function(schedule) {
        return !parseInt(schedule.course_id) && !parseInt(schedule.course_id2);
      },
      /// Sets middle to true for the schedule of the week for middle 
      /// term reporting for the schedule [group].
      calcMiddleWeek: function(group) {
        var schedules = group.schedules;
        var vacations = utils.where(schedules, utils.vacation);
        var total = utils.keys(schedules).length;
        var effective = total - utils.keys(vacations).length;
        var middle = parseInt(group.mid_week) ||
            Math.floor(effective / 2) + 1;

        var i = 0;
        for(var id in schedules) {
          var schedule = schedules[id];

          if (utils.vacation(schedule)) continue;
          if (++i == middle) {
            schedule.middle = true;
            return;
          }
        }
      },
      toGuanxiuHour: function(minutes) {
        return Math.min(minutes/60.0, this.maxGuanxiuTime).toFixed(1);
      },
      /// Given a string [data], creates a data url.
      ///
      /// The previously created data url is stored in [file] and will be
      /// destroyed.
      createDataUrl: function(data, file) {
        data = new Blob([data], {type: 'text/plain'});
        if (file) window.URL.revokeObjectURL(file);
        return window.URL.createObjectURL(data);
      },
      
      getUrlParameter: function(name) {
        var result = null;
        var params = location.search.substr(1).split("&");
        for (var i in params) {
            var pair = params[i].split('=');
            if (pair[0] === name) return pair[1];
        }
      },
      
      getTasks: function(rpc, depId, classId) {
        var tasks;

        function getTasks() {
          return rpc.get_tasks(depId).then(function(response) {
            return tasks = response.data;
          });
        }

        function getArranges() {
           if (!classId) return tasks;

          return rpc.get_task_arranges(classId).then(function(response) {
            var arranges = response.data;
            utils.forEach(tasks, function(task) {
              var arrange = arranges[task.id];
              if (!arrange) return;

              task.starting_half_term = parseInt(arrange.start_half_term) ||
                  task.starting_half_term; 
              task.report_half_term = parseInt(arrange.report_half_term) ||
                  task.report_half_term;
            });
            tasks = utils.where(tasks, function(task) {
            	  return task.starting_half_term < 18;
            });
            return tasks;
          });
        }
        
        return utils.requestOneByOne([getTasks, getArranges]);
      },
      showEmailDialog: function(classes) {
        var dialog = document.getElementById('email-dialog');
        dialog.open();
        var scope = angular.element(dialog).scope();
        scope.classes = classes;
      },
      showElectionDialog: function(onCreate) {
        var dialog = document.getElementById('create-election-dialog');
        dialog.open();
        var scope = angular.element(dialog).scope();
        scope.onCreate = onCreate;
      },
      showVoteMailDialog: function(election) {
        var dialog = document.getElementById('vote-mail-dialog');
        dialog.open();
        var scope = angular.element(dialog).scope();
        scope.election = election;
      },
      showMoveInventoryDialog: function(item, district) {
        var dialog = document.getElementById('move-inventory-dialog');
        dialog.open();
        var scope = angular.element(dialog).scope();
        scope.district = district;
        scope.item = item;
        scope.deferred = $q.defer();
        return scope.deferred.promise;
      },
      showDistrictEditDialog: function(district) {
        var dialog = document.getElementById('district-edit-dialog');
        dialog.open();
        var scope = angular.element(dialog).scope();
        scope.district = district;
      },
      showZBLoginDialog: function(progress) {
        var dialog = document.querySelector('#zb-login');
        dialog.open();
        var scope = angular.element(dialog).scope();
        scope.deferredLogin = $q.defer();
        scope.progress = progress;
        return scope.deferredLogin.promise;
      },
      showConfirmGraduateDialog: function(classInfo) {
        var dialog = document.getElementById('confirm-graduate');
        dialog.open();
        var scope = angular.element(dialog).scope();
        scope.classInfo = classInfo;
      },
      showChooseClassTermDialog: function(classId, term) {
        var dialog = document.getElementById('choose-class-term');
        dialog.open();
        var scope = angular.element(dialog).scope();
        scope.selection = {
          classId: classId,
          term: term
        };
        scope.deferred = $q.defer();
        return scope.deferred.promise;
      },
      addressFields: ['name', 'street', 'city', 'state',
          'country', 'zip', 'phone', 'email'],
      getDistrictAddress: function(rpc, district) {
        var addr = {name: 'BICW - SEATTLE', zip: '98040', country: 'US',
            street: '8055 West Mercer Way', city: 'Mercer Island', state: 47};
        return rpc.get_districts().then(function(response) {
          var districtInfo = response.data[district];
          utils.addressFields.forEach(function(field) {
            addr[field] = districtInfo['cfo_' + field];
          });
          addr.paypal_client_id = districtInfo.paypal_client_id;
          return addr;
        });
      },
      /// Given a Chinese name, return its pinyin.
      /// e.g. Input: 张三, output ['San', 'Zhang'].
      getPinyinName: function(name, pinyinTable) {
    	    var m = name.match(/[a-zA-Z ]+/);
    	    if (m && m[0]) return m[0].split(' ');

        const toHex = (char) => {
        	  var s = char.toString(16).toUpperCase();
        	  return s.length < 4 ? ('0' + s) : s;
        }
        const capitalize = (s) => s.replace(/^\w/, c => c.toUpperCase());
        const getFirstName = (name) => {
        	  var firstName = '';
        	  for (var index = 1; index < name.length; index++) {
        		var ch = toHex(name.charCodeAt(index));
        		firstName += pinyinTable[ch];
        	  }
        	  return capitalize(firstName);
        };
        const getLastName = (name) => {
        	  var ch = toHex(name.charCodeAt(0));
        	  return capitalize(pinyinTable[ch]);
        };
        return [getFirstName(name), getLastName(name)];
      },
      summarize_order: function(order) {
        order.sub_total = 0.0;
        order.shipping = 0.0;
        utils.forEach(order.items, function(item) {
          item.count = parseInt(item.count);
          order.sub_total += item.count * parseMoney(item.price);
          order.shipping += item.count * parseMoney(item.shipping);
        });
      },
      calculate_order_values: function(order) {
        order.status = parseInt(order.status);
        utils.summarize_order(order);
        order.district = parseInt(order.district) || 0;
        order.sub_total = parseMoney(order.sub_total).toFixed(2);
        order.shipping = parseMoney(order.shipping).toFixed(2);
        order.int_shipping = parseMoney(order.int_shipping).toFixed(2);
        order.shipping_donation = parseMoney(
            order.shipping_donation).toFixed(2);
        order.paid = parseMoney(order.paid).toFixed(2);

        order.grand_total = parseMoney(order.sub_total) + 
            parseMoney(order.shipping) +
            parseMoney(order.shipping_donation);
        order.grand_total = order.grand_total.toFixed(2);
        order.balance = 
            parseMoney(order.grand_total) - parseMoney(order.paid);
        order.balance = order.balance.toFixed(2);
      },
      showInfo: function(message) {
        var toast = document.querySelector('paper-toast');
        toast.text = message;
        toast.open();
        return toast;
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
      permanentIndex: 6,
      // Indicating whether the student is self learning or not.
      selfLearningIndex: 7,
      // Indicating whether the student don't practice.
      wensiIndex: 8,
      
      weeksOfTerm: 26,
      totalTerms: 12,
      // The zb system enforce a cap of the maximum guanxiu hours. 
      maxGuanxiuTime: 25.5,
      // A lot of people were not able to report their tasks
      // in time. Add this extra 15 days to avoid a zero number.
      extraReportTime: 3600 * 24 * 15
    };
    return utils;
  });
});
