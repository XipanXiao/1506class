define(['permission', 'services', 'utils'], function() {
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

  function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
  }
  
  var sqlFile, tsvFile;

  var columnMap = {
    "table": "users",
    "columns": {
      "年別": "start_year",
      "start_year": "start_year",
      "序号": "internal_id",
      "internal_id": "internal_id",
      "姓名": "name",
      "name": "name",
      "性别": "sex",
      "sex": "sex",
      "出生年月": "birthday",
      "birthday": "birthday",
      "文化程度": "education",
      "education": "education",
      "职业": "occupation",
      "occupation": "occupation",
      "预选班级": "classId",
      "classId": "classId",
      "联系电话": "phone",
      "phone": "phone",
      "电子邮箱或QQ号": "email",
      "email": "email",
      "居住省份/直辖市": "state",
      "state": "state",
      "市/县/区": "city",
      "city": "city",
      "街道": "street",
      "street": "street",
      "Status": "notes",
      "notes": "notes",
      "comments": "comments",
      "zip": "zip",
      "nickname": "nickname",
      "street2": "street2",
      "country": "country",
      "im": "im",
      "mentro_id": "mentor_id",
      "permission": "permission"
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

  return angular.module('ImportersModule', ['PermissionModule',
      'ServicesModule', 'UtilsModule'])
      .factory('importers', function(perm, rpc, utils) {

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
      
      user.email = user.email.toLowerCase();
      user.birthday = extractFromPatter(/([0-9]{4}-[0-9]{1,2}-[0-9]{1,2})/,
          user.birthday);
      user.birthday_label = user.birthday;
      user.birthday = user.birthday ? (user.birthday + ' 00:00:00') : ''; 
      
      user.occupation = cutOff(user.occupation, 16);

      user.classId_label = user.classId && user.classId.trim();
      if (!user.classId_label) {
        user.classId = 1;
      } else {
        var classLabel = parseInt(user.classId_label.substring(0, 4)) ?
            user.classId_label : user.start_year + user.classId_label; 

        var classInfo = utils.firstElement(classes,
            'name', classLabel);
        user.classId = (classInfo && classInfo.id) || 0;
      }
      
      ['sex', 'education'].forEach(function(key) {
        var label = user[key] && user[key].trim() || 'default';
        user[key + '_label'] = label;
        user[key] = columnMap[key][label];
      });
      
      var start_year_label = user['start_year'] && user['start_year'].trim();
      user['start_year_label'] = start_year_label;
      if (start_year_label.startsWith('1')) {
        user['start_year'] = 2000 + parseInt(start_year_label.substring(0,2));
      } else if (start_year_label.startsWith('2')) {
        user['start_year'] = parseInt(start_year_label.substring(0,4));
      }
      
      user.phone = cutOff(user.phone, 16);
      user.state = cutOff(user.state, 8);
      user.city = cutOff(user.city, 16);
      if (encode_utf8(user.city).length > 32) {
        user.city = cutOff(user.city, 8);
      }

      if (!user.zip) {
        var zip = user.street && user.street.substring(user.street.length-5);
        user.zip = /[0-9]{5}/.test(zip) ? zip : '';
      }
      
      user.street = cutOff(user.street && user.street.split(/[,，]/)[0] || '',
          32);
      if (encode_utf8(user.street).length > 64) {
        user.street = cutOff(user.street, 16);
      }

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
  
            var removeQuations = function(value) {
              return value.replace(/"(.*)"/, '$1');
            };
            
            var index = 1;
            var recordsMap = {};
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
                user[result.columns[c]] = removeQuations(columnValues[c]);
              }
              
              if (validate(user, response.data) && !recordsMap[user.email]) {
                result.records.push(user);
                recordsMap[user.email] = true;
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
                user.birthday = user.birthday || existingUser.birthday;
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
                var column = columnMap.columns[key];
                update[column] = user[column];
              }
            }
            
            if (!user.classId){
              update.classId_label = user.classId_label;
              update.start_year_label = user.start_year_label;
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
        },
        
        exportAll: function() {
          var int_fields = ['sex', 'mentor_id', 'permission', 'education',
              'start_year', 'classId'];
          var fields = ['internal_id', 'name', 'nickname', 'email',
              'phone', 'street', 'street2', 'city', 'state', 'country', 'zip',
              'im', 'occupation', 'birthday', 'notes'];
          var allFields = fields.concat(int_fields);

          var createDataUrl = function(data, file) {
            data = new Blob([data], {type: 'text/plain'});
            if (file) window.URL.revokeObjectURL(file);
            return file = window.URL.createObjectURL(data);
          };
          
          var exportUsers = function(users, classes) {
            var sql = '';
            var tsv = fields.concat(int_fields).join('\t');

            var convertIntValue = function(key, value) {
              return {
                'sex': ['女', '男'],
                'classId': classes,
                'permission': perm.permissions,
                'education': ['', '高中以下', '大专或高中', '本科', '硕士', '博士'],
                'mentor_id': [],
                'start_year': []
              }[key][value];
            };

            for (var id in users) {
              var user = users[id];
              var getValue = function(field) {
                return '"' + (user[field] || '') + '"';
              };
              var getIntValue = function(field) {return parseInt(user[field]);};
              var allValues = utils.map(fields, getValue)
                  .concat(utils.map(int_fields, getIntValue));
              sql += 'INSERT INTO users ({0}) VALUES ({1});\n'.format(
                  allFields.join(', '), allValues.join(', '));

              var displayValues = utils.map(fields, getValue);
              for (var i = 0;i < int_fields.length; i++) {
                var key = int_fields[i];
                var value = getIntValue(key);
                displayValues[i + fields.length] =
                    '"{0}"'.format(convertIntValue(key, value) || value);
              }
              tsv += '\n' + displayValues.join('\t');
            }

            return {
              sql: createDataUrl(sql, sqlFile),
              tsv: createDataUrl(tsv, tsvFile)
            };
          };

          return rpc.get_classes().then(function(response) {
            var classes = {};
            for (var id in response.data) {
              classes[id] = response.data[id].name;
            }

            return rpc.get_users(null, null, true).then(function(response) {
              return exportUsers(response.data, classes);
            });
          });
        }
      }
    };
  });
});
