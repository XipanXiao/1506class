define(['services', 'utils'], function() {
  var delimiter = '\t';

  var lineReader = function(text, skipHeader) {
    var lines = text.split(/[\r\n]+/g);
    var index = skipHeader ? 1 : 0;
    return {
      columns: lines[0].split(delimiter),
      next: function() {
        return lines[index++];
      },
      lines: lines.length
    };
  };
  
  var columnMap = {
    "table": "users",
    "columns": {
      "年別": "start_year",
      "序号": "internal_id",
      "姓名": "name",
      "性别": "sex",
      "出生年月": "birthday",
      "文化程度": "education",
      "职业": "occupation",
      "预选班级": "classId",
      "联系电话": "phone",
      "电子邮箱或QQ号": "email",
      "居住省份/直辖市": "state",
      "市/县/区": "city",
      "街道": "street",
      "Status": "notes",
      "zip": "zip"
    },
    "start_year": {
      "1206": 2012,
      "1212": 2012,
      "1306": 2013,
      "1312": 2013,
      "1403": 2014,
      "1406": 2014,
      "1503": 2015,
      "1506": 2015,
      "default": 2015
    },
    "sex": {
      "男": 1,
      "女": 0,
      "default": 0,
    },
    "education": {
      "初中或初中以下": 1,
      "College": 3,
      "Master": 4,
      "undergraduate": 3,
      "专科": 2,
      "中专": 1,
      "初中": 1,
      "博士": 5,
      "大专": 2,
      "大学": 3,
      "大學": 3,
      "大專": 2,
      "大本": 3,
      "小学": 1,
      "教师": 3,
      "本科": 3,
      "硕士": 4,
      "碩士": 4,
      "高中": 2,
      "研究所": 4,
      "研究生": 4,
      "会计大专": 2,
      "大学本科": 3,
      "大學畢業": 3,
      "初中及以下": 1,
      "硕士及以上": 4,
      "本科（在读）": 3,
      "博士（经济学）": 5,
      "default": 1
    }
  };

  return angular.module('ImportersModule', ['ServicesModule', 'UtilsModule'])
      .factory('importers', function(rpc, utils) {

    var validate = function(user, classes) {
      var extractFromPatter = function(pattern, value) {
        var match = pattern.exec(value);
        return match && match[1];
      };
      
      var cutOff = function(value, len) {
        return value && value.substring(0, len);
      };
      
      user.name = cutOff(user.name, 16);
      if (!user.name) return false;
      
      user.email = extractFromPatter(
          /(\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+)/, user.email);
      if (!user.email) return false;
      
      user.birthday = extractFromPatter(/([0-9]{4}-[0-9]{1,2}-[0-9]{1,2})/,
          user.birthday);
      user.birthday_label = user.birthday;
      if (user.birthday) user.birthday = user.birthday + ' 00:00:00'; 
      
      user.occupation = cutOff(user.occupation, 16);

      user.classId_label = user.classId;
      var classInfo = utils.firstElement(classes,
          'name', user.start_year + user.classId_label);
      user.classId = (classInfo && classInfo.id) || 0;
      
      ['start_year', 'sex', 'education'].forEach(function(key) {
        user[key + '_label'] = user[key];
        user[key] = columnMap[key][user[key] && user[key].trim() || 'default'];
      });
      
      user.phone = cutOff(user.phone, 16);
      user.state = cutOff(user.state, 8);
      user.city = cutOff(user.city, 32);
      
      var zip = user.street && user.street.substring(user.street.length-5);
      user.zip = /[0-9]{5}/.test(zip) ? zip : '';
      
      user.street = cutOff(user.street && user.street.split(',')[0] || '',
          32);
      user.start_year = columnMap.start_year[user.start_year_label];
      user.sex = columnMap.sex[user.sex_label];
      user.education = columnMap.education[user.education_label];
      return true;
    };

    return {
      userImporter: {
        analyze: function(text, progress, scope) {

          return rpc.get_classes().then(function(response) {
            var reader = lineReader(text, true);
            var headerToColumn = function(header) {
              return columnMap.columns[header];
            };
            var result = {
              headers: reader.columns,
              columns: utils.map(reader.columns, headerToColumn),
              records: [],
              skipped: []
            };
  
            var index = 0;
            var next = function() {
              var line = reader.next();
              if (!line) {
                setTimeout(function() {
                  progress && progress(++index, reader.lines, null, result);
                  scope.$apply();
                }, 0);
                return;
              }
              
              var user = {};
              var columnValues = line.split(delimiter);
              for (var c = 0; c < reader.columns.length; c++) {
                user[result.columns[c]] = columnValues[c];
              }
              
              if (validate(user, response.data)) {
                result.records.push(user);
              } else if (user.name) {
                result.skipped.push(line);
              }

              progress && progress(++index, reader.lines, null, result);
              
              /// Yield every 10 records to update UI.
              index % 10 == 0 ? setTimeout(function() {
                scope.$apply();
                next();
              }, 0) : next();
            };
            
            next();
          });
        },
        
        diff: function(users, callback) {
          var idx = 0;
          
          var next = function() {
            var user = users[idx++];
            if (!user) return;

            rpc.get_user(user.email).then(function(existingUser) {
              if (!existingUser || !existingUser.email) existingUser = null;
              if (existingUser) {
                var ignored = ['classInfo', 'password', 'permission'];
                ignored.forEach(function(key) {delete existingUser[key]});

                user.id = existingUser.id;
                utils.diff(existingUser, user);
              } else {
                user.id = 0;
                user.changed = true;
              }

              if (user.changed) {
                user.checked = true;
              }
              
              callback && callback(idx, null, user);
              next();
            });
          };
          
          next();
        },
        
        submit: function(users, callback) {
          var idx = 0;
          
          var next = function() {
            var user = users[idx++];
            if (!user) return;
            if (!user.changed || !user.checked) {
              setTimeout(next, 0);
              return;
            }
            
            var update = {id: user.id};
            if (user.oldData) {
              for (var key in user.oldData) {
                update[key] = user[key];
              }
            } else {
              for (var key in columnMap.columns) {
                var column = columnMap[key];
                update[column] = user[column];
              }
            }
            
            var then = function(response) {
              user.submitted = (1 == response.data.updated);
              user.error = response.data.error;

              callback(idx, null, user);
              next();
            };
            
            rpc.update_user(update).then(then);
          };
          
          next();
        }
      }
    };
  });
});
