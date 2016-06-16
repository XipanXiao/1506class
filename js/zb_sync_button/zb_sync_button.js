define('zb_sync_button/zb_sync_button',
    ['progress_bar/progress_bar', 'services', 'utils',
     'zb_services'], function() {
  return angular.module('ZBSyncButtonModule', ['ProgressBarModule',
      'ServicesModule', 'UtilsModule', 'ZBServicesModule'])
      .directive('zbSyncButton', function($q, $rootScope, rpc, utils, zbrpc) {
      return {
        scope: {
          classId: '=',
          scheduleGroup: '=',
          task: '=',
          type: '@',
          users: '=',
        },
        link: function(scope) {
          scope.$watch('classId', function() {
            if (!scope.classId) return;
            rpc.get_classes(scope.classId).then(function(response) {
              scope.classInfo = response.data[scope.classId];
              if (scope.scheduleGroup) {
                scope.zbUrl = zbrpc.get_report_result_url(scope.classInfo.zb_id,
                    scope.scheduleGroup.term * 2);
              }
            });
          });
          scope.sync = function() {
            if (scope.inprogress) return;
            scope.inprogress = true;

            var done = function() {
              scope.inprogress = false;
            };
            switch (scope.type) {
            case 'schedule_task':
              var half_terms = scope.getHalfTerms().length;
              if (half_terms == 0) return;

              utils.requestOneByOne([
                  scope.ensure_authenticated,
                  scope.report_attendance,
                  scope.report_schedule_task,
                  scope.report_jx_task,
                  scope.report_guanxiu_task
              ]).then(done);
              break;
            case 'class':
              utils.requestOneByOne([
                  scope.ensure_authenticated,
                  scope.sync_class
              ]).then(done);
              break;
            }
          };
          
          scope.getBookAudioRecords = function(user, limited) {
            var index = 0;
            var group = scope.scheduleGroup;
            var audio = [];
            var book = [];

            if (limited) {
              utils.forEach(group.limited_courses, function(course) {
                var record = user.records[course.id];
                audio[index] = (record && record.video) ? 1 : 0;
                book[index] = (record && record.text) ? 1 : 0;
                index++;
              });
            } else {
              for (var id in group.schedules) {
                var schedule = group.schedules[id];
                if (!parseInt(schedule.course_id)) continue;
                var record = user.records[schedule.course_id];
                audio[index] = (record && record.video) ? 1 : 0;
                book[index] = (record && record.text) ? 1 : 0;
                index++;
              }
            }
            
            var half = limited ? 2 : 11;
            return [
              {audio: audio.slice(0, half), book: book.slice(0, half)},
              {audio: audio.slice(half), book: book.slice(half)}
            ];
          };

          scope.get_attendance = function(user) {
            var index = 0;
            var group = scope.scheduleGroup;
            var half = 11;
            var att = [0, 0];

            for (var id in group.schedules) {
              var schedule = group.schedules[id];
              if (!parseInt(schedule.course_id)) continue;

              var record = user.records[schedule.course_id];
              if (record && (record.attended == 1)) {
                if (index < half) att[0] ++;
                else att[1]++;
              }
              
              index++;
            }
            
            return att;
          };
          
          scope.getMidTerm = function() {
            var startDate = utils.toDateTime(scope.scheduleGroup.start_time);
            var midTerm = new Date(startDate.getTime());
            midTerm.setDate(startDate.getDate() + 7 * 12);
            return utils.unixTimestamp(midTerm);
          };
          
          scope.getEndTerm = function() {
            var startDate = utils.toDateTime(scope.scheduleGroup.start_time);
            var endTerm = new Date(startDate.getTime());
            endTerm.setDate(startDate.getDate() + 7 * 25);
            return utils.unixTimestamp(endTerm);
          };
          
          // Determine which half terms to report, based on current time.
          scope.getHalfTerms = function() {
            var now = utils.unixTimestamp(new Date());
            var midTerm = scope.getMidTerm();

            // Before middle of the current term, nothing to report yet.
            if (now < midTerm) return [];

            var endTerm = scope.getEndTerm();
            
            // Between mid-term and the end of the term, report the first half.
            if (midTerm <= now && now < endTerm) {
              return [0];
            }
            
            // Report both the first and the second half terms.
            return [0, 1];
          };
          scope.report_schedule_task = function() {
            var taskKey = '传承';
            var half_terms = scope.getHalfTerms();
            var half_term_base = scope.scheduleGroup.term * 2;
            var users = scope.users;

            var requests = [];
            scope.statusText = '正在提交听传承和读法本记录...';
            scope.totalTasks = 0;
            scope.finished = 0;

            half_terms.forEach(function(half_term) {
              utils.forEach(users, function(user) {
                if (scope.checkUserTask(user, taskKey, half_term)) return;

                var request = function() {
                  var records = scope.getBookAudioRecords(user);
                  var reportPromise = zbrpc.report_schedule_task(
                      parseInt(scope.classInfo.zb_id), parseInt(user.zb_id),
                      half_term_base + half_term, records[half_term].book,
                      records[half_term].audio).then(function(response) {
                        scope.finished++;
                        return scope.checkResponse(response, user, taskKey,
                            half_term);
                      });
                  return reportPromise;
                };
                requests.push(request);
              });
            });
            scope.totalTasks = requests.length;
            return utils.requestOneByOne(requests);
          };
          scope.checkResponse = function(response, user, task, half_term) {
            var success = response.data &&
                (response.data.returnValue == 'success');
            if (success) {
              var userResult = scope.results[user.id]; 
              if (!userResult) userResult = [];
              var result = userResult[half_term] || {};
              result[task] = true;
              userResult[half_term] = result;
              scope.results[user.id] = userResult;
              return true; 
            }
            alert('学员"{0}"的"{1}"记录未能成功提交，请重试'.format(user.name, task));
            return false;
          };
          scope.checkUserTask = function(user, task, half_term) {
            return scope.results[user.id] &&
                scope.results[user.id][half_term] &&
                scope.results[user.id][half_term][task];
          };
          scope.ensure_authenticated = function() {
            scope.finished = 0;
            scope.totalTasks = 1;

            scope.statusText = '正在检查是否登录并具有编辑权限...';
            return zbrpc.is_authenticated().then(function(authenticated) {
              scope.finished++;
              return authenticated || scope.showLoginDialog();
            });
          };
          scope.showLoginDialog = function() {
            scope.username = 'zhibeihw1';
            document.querySelector('#zb-login').open();
            scope.deferredLogin = $q.defer();
            return scope.deferredLogin.promise;
          };
          scope.$on('zb-login-confirmed', function(event, credential) {
            var username = credential.username;
            var password = credential.password;
            var editPassword = credential.editPassword;

            scope.finished = 0;
            scope.totalTasks = 1;

            scope.statusText = '正在登录...';
            zbrpc.login(username, password).then(function(response) {
              if (zbrpc.is_showing_login_form(response.data)) {
                scope.finished++;
                alert('登录失败');
              } else {
                zbrpc.edit(editPassword).then(function(approved) {
                  scope.finished++;
                  approved ? 
                      scope.deferredLogin.resolve(true) :
                      scope.deferredLogin.reject();
                });
              }
            });
          });

          scope.report_class_task_stats = function(task, half_term) {
            var startTerm =
                utils.roundToDefaultStartTime(scope.scheduleGroup.start_time);
            var midTerm = scope.getMidTerm();
            var endTerm = utils.roundToDefaultStartTime(scope.getEndTerm());
            var start_time = (half_term % 2 == 0) ? startTerm : midTerm;
            var end_time = (half_term % 2 == 0) ? midTerm : endTerm;

            return rpc.get_class_task_stats(scope.classId, task.id,
                start_time, end_time).then(function(response) {
                  scope.statusText = '正在提交"{0}"任务记录...'.format(task.name);

                  var requests = [];
                  (response.data || []).forEach(function(user) {
                    if (!user.stats || !user.stats[0] ||
                        !user.stats[0].sum) {
                      return;
                    }

                    if (scope.checkUserTask(user, task.name, half_term % 2)) {
                      return;
                    }
                    var request = function() {
                      var record = {};
                      record[task.zb_name + '_count'] = user.stats[0].sum;
                      var promise = zbrpc.report_preparation_task(
                          scope.classInfo.zb_id, user.zb_id,
                          half_term, record).then(function(response) {
                            scope.finished++;
                            return scope.checkResponse(response, user,
                                task.name, half_term % 2);
                          });
                      return promise;
                    };
                    requests.push(request);
                  });

                  scope.totalTasks += requests.length;
                  return utils.requestOneByOne(requests);
                });
          };

          scope.getTaskSubIndexes = function(task, half_term) {
            return zbrpc.get_preclass_lessions(scope.classInfo.zb_id,
                task.zb_course_id, half_term).then(function(response) {
                  var data = response.data.data;
                  return (data || []).map(function(lesson) {
                    return parseInt(lesson.lesson_id);
                  });
                });
          };

          /// Converts Guanxiu records to the format that accepted by the zhibei
          /// system.
          /// Input:
          ///  [
          ///     {"sub_index":6,"sum":2,"duration":70},
          ///     {"sub_index":7,"sum":1,"duration":30},
          ///     {"sub_index":9,"sum":1,"duration":30}
          ///  ]
          /// Output:
          /// {count: [2, 1, 0, 1], time: [1.2, 0.5, 0, 0.5]}
          scope.getTimedTaskRecords = function(stats, indexes) {
            var count = [], time = [];
            indexes.forEach(function(index) {
              var record = stats[index - 1];
              count.push(record && record.sum || 0);
              time.push((record && record.duration || 0) / 60.0);
            });
            
            return {
              count: count,
              time: time
            }
          };
          
          scope.report_guanxiu_task = function() {
            var half_terms = scope.getHalfTerms();

            scope.totalTasks = 0;
            scope.finished = 0;

            var promises = [];
            half_terms.forEach(function(half_term) {
              half_term += scope.scheduleGroup.term * 2;

              for (var id in scope.tasks) {
                var task = scope.tasks[id];
                // Skip tasks that not started.
                if (!task.duration || !task.zb_course_id ||
                    task.starting_half_term > half_term) {
                  continue;
                }

                promises.push(scope.report_guanxiu_task_stats(task, half_term));
              }
            });
            return $q.all(promises);
          };

          scope.report_guanxiu_task_stats = function(task, half_term) {
            return scope.getTaskSubIndexes(task, half_term).then(
                function(indexes) {
                  if (indexes.length == 0) return;

                  var start_time = indexes[0];
                  var end_time = indexes[indexes.length - 1];

                  return rpc.get_class_task_stats(scope.classId, task.id,
                      start_time, end_time, 1).then(function(response) {
                        scope.statusText =
                            '正在提交"{0}"任务记录...'.format(task.name);

                        var requests = [];
                        (response.data || []).forEach(function(user) {
                          if (!user.stats || !user.stats.length) {
                            return;
                          }

                          if (scope.checkUserTask(user, task.name, 
                              half_term % 2)) return;

                          var record = scope.getTimedTaskRecords(user.stats,
                              indexes);
                          var nonZero = function(value) {return value != 0;};
                          if (!utils.any(record.count, nonZero)) return;

                          var request = function() {
                            var promise = zbrpc.report_guanxiu_task(
                                scope.classInfo.zb_id, user.zb_id,
                                half_term, record.count,
                                record.time).then(function(response) {
                                  scope.finished++;
                                  return scope.checkResponse(response, user,
                                      task.name, half_term % 2);
                                });
                            return promise;
                          };
                          requests.push(request);
                        });

                        scope.totalTasks += requests.length;
                        utils.requestOneByOne(requests);
                      });
                });
          };

          scope.report_jx_task = function() {
            var half_terms = scope.getHalfTerms();
            var depId = scope.classInfo.department_id;

            return rpc.get_tasks(depId).then(function(response) {
              scope.tasks = response.data;
              scope.totalTasks = 0;
              scope.finished = 0;

              var promises = [];
              half_terms.forEach(function(half_term) {
                half_term += scope.scheduleGroup.term * 2;

                for (var id in scope.tasks) {
                  var task = scope.tasks[id];
                  // Skip tasks that not started.
                  if (task.duration || !task.zb_name ||
                      task.starting_half_term > half_term) {
                    continue;
                  }

                  promises.push(scope.report_class_task_stats(task, half_term));
                }
              });
              return $q.all(promises).then(function(results) {
                for (var index in results) {
                  if (!results[index]) return false;
                }
                return true;
              });
            });
          };

          scope.report_attendance = function() {
            var taskKey = '出席';
            scope.statusText = '正在提交出席记录...';
            scope.totalTasks = 0;
            scope.finished = 0;

            var requests = [];
            var half_terms = scope.getHalfTerms();

            utils.forEach(scope.users, function(user) {
              var atts = scope.get_attendance(user);
              var records = scope.getBookAudioRecords(user, true);
              var userID = parseInt(user.zb_id);

              half_terms.forEach(function(half_term) {
                if (scope.checkUserTask(user, taskKey, half_term)) return;

                var request = function() {
                  var promise = zbrpc.report_limited_schedule_task(
                      scope.classInfo.zb_id, userID,
                      half_term + scope.scheduleGroup.term * 2,
                      records[half_term].book, records[half_term].audio,
                      atts[half_term]).then(function(response) {
                        scope.finished++;
                        return scope.checkResponse(response, user, taskKey,
                            half_term);
                      });
                  return promise;
                };
                requests.push(request);
              });
            });

            scope.totalTasks += requests.length;
            return utils.requestOneByOne(requests);
          };

          scope.getLocalId = function() {
            return rpc.get_classes().then(function(response) {
              scope.classInfo = response.data[scope.classId];
              var classes = utils.where(response.data, function(classInfo) {
                return classInfo.start_year == scope.classInfo.start_year &&
                    classInfo.department_id == scope.classInfo.department_id;
              });
              var localId = 0;
              for (var id in classes) {
                localId++;
                if (id == scope.classId) return localId;
              }
            });
          };
          // deparment 1: 基础班
          // deparment 2: 入行论班
          // deparment 3: 加行班
          // deparment 4: 净土班
          // courseId: 加行：1，入行论：2，净土：3
          scope.get_zb_courseId = function(departmentId) {
            return {
              2: 2,
              3: 1,
              4: 3
            }[departmentId];
          };

          scope.sync_users = function() {
            var taskKey = '用户信息';
            var users = scope.users;
            var pre_classID = scope.classInfo.zb_id;
            
            scope.statusText = '正在获取智悲用户列表...';

            scope.totalTasks += 1;

            return zbrpc.list_users(pre_classID).then(function(response) {
              scope.finished++;

              var zb_users = response.data.data;
              scope.update_zb_ids(users, zb_users);

              var requests = [];
              utils.forEach(users, function(user) {
                if (scope.checkUserTask(user, taskKey, 0)) return;
                
                var request = function() {
                  return (user.zb_id ? zbrpc.update_user(user) :
                    zbrpc.create_user(pre_classID, user))
                        .then(function(response) {
                          scope.finished++;
                          return scope.checkResponse(response, user, taskKey,
                              0);
                        });

                };
                requests.push(request);
              });
              scope.totalTasks += requests.length;
              scope.statusText = '正在推送用户信息...';

              return utils.requestOneByOne(requests);
            });
          },
          /// courseId: 加行：1，入行论：2，净土：3
          /// startdate: '2015-06-01'
          /// district1: '美国'
          /// localID: 1, 2, 3, ...
          scope.sync_class = function() {
            var classInfo = scope.classInfo;

            if (classInfo.zb_id) {
              return scope.sync_users();
            }

            scope.totalTasks = 2;
            scope.finished = 0;
            scope.statusText = '正在查找班级信息';

            // courseId, startdate, district1, localID
            var courseId = scope.get_zb_courseId(classInfo.department_id);
            var startdate = '' + classInfo.start_year + '-06-01';
            return scope.getLocalId().then(function(localID) {
              scope.finished++;
              
              scope.localID = localID;
              return zbrpc.search_class(courseId, startdate, '美国', localID)
              .then(function(response) {
                scope.finished++;

                var results = response.data.data;
                if (results && results[0]) {
                  classInfo.zb_id = results[0].pre_classID;
                  rpc.update_class(classInfo);
                  return scope.sync_users();
                }

                scope.totalTask += 1;
                return zbrpc.get_root_groups().then(function(response) {
                  scope.finished++;
                  
                  $rootScope.$broadcast('init-zb-roots', {
                    zbGroups: response.data.data,
                    rootGroupSelected: scope.rootGroupSelected,
                  });
                  document.querySelector('#zb-choose-root').open();

                  scope.deferredSyncClass = $q.defer();
                  return scope.deferredSyncClass.promise;
                });
              });
            });
          };
          /// Store zb ids for corresponding users in database.
          scope.update_zb_ids = function(users, zb_users) {
            var zb_users_map = {};
            zb_users.forEach(function(zb_user) {
              zb_users_map[zb_user.name] = zb_user;
            });

            var requests = [];
            utils.forEach(users, function(user) {
              var zb_user = zb_users_map[user.name];
              // Skip deleted users.
              if (!zb_user || parseInt(zb_user.status) == 11) return;

              var oldId = user.zb_id;
              user.zb_id = zb_user.userID;
              if (parseInt(oldId) != parseInt(user.zb_id)) {
                var request = function() {
                  return rpc.update_user(user).then(function(response) {
                    return response.data.updated;
                  });
                };
                requests.push(request);
              }
            });
            
            return utils.requestOneByOne(requests);
          };
          scope.rootGroupSelected = function(selectedZbGroupId) {
            var classInfo = scope.classInfo;
            var courseId = scope.get_zb_courseId(classInfo.department_id);
            var startdate = '' + classInfo.start_year + '-06-01';
            
            scope.statusText = '正在创建智悲班级';
            scope.totalTasks += 1;

            return zbrpc.create_class(selectedZbGroupId,
                courseId, startdate, '美国', scope.localID)
                .then(function(response) {
                  scope.finished++;

                  classInfo.zb_id = response.data.pre_classID;
                  if (classInfo.zb_id) {
                    rpc.update_class(classInfo);
                    scope.sync_users().then(function(result) {
                      scope.deferredSyncClass.resolve(result);
                    });
                  }
                  alert('failed to create zhibei class.');
                  scope.deferredSyncClass.resolve(false);
                });
          };
          scope.totalTasks = 0;
          scope.finished = 0;
          scope.results = {};
        },
        templateUrl: 'js/zb_sync_button/zb_sync_button.html'
      };
    });
});
