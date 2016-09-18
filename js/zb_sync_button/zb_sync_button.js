define('zb_sync_button/zb_sync_button',
    ['progress_bar/progress_bar', 'services', 'utils',
     'zb_services'], function() {
  var JIA_XING = 3;

  var MAIN_GRID = 0;
  var WORK_GRID = 1;
  var ATT_LIMIT_GRID = 2;
  var GUANXIU_GRID = 3;
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
              scope.zbUrl = zbrpc.get_report_result_url(scope.classInfo.zb_id,
                  scope.scheduleGroup ? scope.scheduleGroup.term * 2 : '');
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
              var half_terms = scope.getHalfTerms();
              var requests = [scope.ensure_authenticated];
              requests = requests.concat(half_terms.map(function(half_term) {
                return function() {
                  scope.half_term = half_term;
                  switch (scope.classInfo.department_id) {
                  case JIA_XING: 
                    return utils.requestOneByOne([
                      scope.report_attendance,
                      scope.report_schedule_task,
                      scope.report_jx_task,
                      scope.report_guanxiu_task
                    ]);
                    break;
                  default:
                    return utils.requestOneByOne([
                      scope.report_attendance,
                      scope.report_schedule_task,
                    ]);
                    break;
                  };
                };
              }));
              utils.requestOneByOne(requests).then(done);
              break;
            case 'class':
              utils.requestOneByOne([
                  scope.check_serial_numbers,
                  scope.ensure_authenticated,
                  scope.sync_class
              ]).then(done);
              break;
            }
          };
          scope.getCourseRecord = function(user, course_id, audio, book) {
            if (!parseInt(course_id)) return;

            var record = user.records[course_id];
            audio.push((record && record.video) ? 1 : 0);
            book.push((record && record.text) ? 1 : 0);
          };
          
          scope.getBookAudioRecords = function(lessons, user, limited) {
            var group = scope.scheduleGroup;
            var audio = [];
            var book = [];

            if (limited) {
              utils.forEach(group.limited_courses, function(course) {
                scope.getCourseRecord(user, course.id, audio, book);
              });
            } else {
              utils.forEach(group.schedules, function(schedule) {
                scope.getCourseRecord(user, schedule.course_id, audio, book);
                scope.getCourseRecord(user, schedule.course_id2, audio, book);
              });
            }

            var schedules = scope.get_report_lessons_count();
            audio = (scope.half_term % 2) == 0 ? audio.slice(0, schedules) :
                audio.slice(audio.length - schedules);
            book = (scope.half_term % 2) == 0 ? book.slice(0, schedules) :
                book.slice(audio.length - schedules);

            if (audio.length * 2 == lessons.length) {

              var duplicate = function(arr) {
                for (var index = arr.length - 1; index >= 0; index--) {
                  arr[index*2] = arr[index*2+1] = arr[index];
                }
                return arr;
              };

              return {
                audio: duplicate(audio),
                book: duplicate(book)
              };
            } else {
              return {
                audio: audio,
                book: book
              };
            }
          };
          
          scope.get_report_lessons_count = function() {
            var lessons = scope.lessons;
            // Some ruxinglun classes take 2 courses for a single schedule. 
            return lessons.length > 15 && lessons.length % 2 == 0 ?
                Math.floor(lessons.length / 2) : lessons.length;
          };

          scope.get_attendance = function(user) {
            var group = scope.scheduleGroup;
            var atts = [];

            for (var id in group.schedules) {
              var schedule = group.schedules[id];
              if (!parseInt(schedule.course_id)) continue;

              var record = user.records[schedule.course_id];
              atts.push(record && record.attended == 1 ? 1 : 0);
            }
            
            var schedules = scope.get_report_lessons_count();
            var firstHalf = scope.half_term % 2 == 0 ?
                schedules : atts.length - schedules;
            var first = 0;
            var second = 0;
            for (var index = 0; index < atts.length; index++) {
              if (index < firstHalf) first += atts[index];
              else second += atts[index];
            }
            return [first, second];
          };

          /// Returns the date after 7*26 days of the start time of the current
          /// schedule group.
          scope.getEndTerm = function() {
            var startDate = utils.toDateTime(scope.scheduleGroup.start_time);
            var endTerm = new Date(startDate.getTime());
            // Each term lasts for 26 weeks.
            endTerm.setDate(startDate.getDate() + 7 * utils.weeksOfTerm);
            return utils.unixTimestamp(endTerm);
          };
          
          // Determine which half terms to report, based on current time.
          scope.getHalfTerms = function() {
            var now = utils.unixTimestamp(new Date());
            var midTerm = utils.getMidTerm(scope.scheduleGroup);

            // Before middle of the current term, nothing to report yet.
            if (now < midTerm) return [];

            var endTerm = scope.getEndTerm();
            
            var half_term_base = scope.scheduleGroup.term * 2;
            // Between mid-term and the end of the term, report the first half.
            if (midTerm <= now && now < endTerm) {
              return [half_term_base];
            }
            
            // Report both the first and the second half terms.
            return [half_term_base, half_term_base + 1];
          };
          scope.report_schedule_task = function() {
            var taskKey = '传承';
            var users = scope.users;

            var requests = [];
            scope.totalTasks = 0;
            scope.finished = 0;

            var lessons = scope.lessons;
            utils.forEach(users, function(user) {
              if (scope.checkUserTask(user, taskKey)) return;

              var records = scope.getBookAudioRecords(lessons, user);
              var request = function() {
                scope.statusText = '正在为"{0}"提交{1}半学期听传承和读法本记录...'.
                    format(user.name, ['上', '下'][scope.half_term % 2]);
                return zbrpc.report_schedule_task(
                    scope.get_report_type(MAIN_GRID),
                    scope.classInfo.zb_id, parseInt(user.zb_id),
                    scope.half_term, records.book,
                    records.audio).then(function(response) {
                      scope.finished++;
                      return scope.checkResponse(response, user, taskKey);
                    });
              };
              requests.push(request);
            });
            scope.totalTasks = requests.length;
            return utils.requestOneByOne(requests);
          };

          scope.checkResponse = function(response, user, task) {
            var success = response.data &&
                (response.data.returnValue == 'success');
            if (success) {
              var userResult = scope.results[user.id]; 
              if (!userResult) userResult = [];
              var result = userResult[scope.half_term % 2] || {};
              result[task] = true;
              userResult[scope.half_term % 2] = result;
              scope.results[user.id] = userResult;
              return true; 
            }
            alert('学员"{0}"的"{1}"记录未能成功提交，请重试'.format(user.name, task));
            return false;
          };
          scope.checkUserTask = function(user, task) {
            return scope.results[user.id] &&
                scope.results[user.id][scope.half_term % 2] &&
                scope.results[user.id][scope.half_term % 2][task];
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
            if (!scope.deferredLogin) return;

            if (credential) {
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
                  scope.deferredLogin.resolve(false);
                } else {
                  zbrpc.edit(editPassword).then(function(approved) {
                    scope.finished++;
                    scope.deferredLogin.resolve(approved);
                  });
                }
              });
            } else {
              scope.deferredLogin.resolve(false);
            }
          });

          scope.report_jx_task_for_user = function(user) {
            var taskKey = '加行';

            if (scope.checkUserTask(user, taskKey) ||
                utils.isEmpty(user.taskStats)) {
              return utils.truePromise();
            }

            scope.statusText = '正在为"{0}"提交{1}半学期"{2}"任务记录...'.format(
                user.name, ['上', '下'][scope.half_term % 2], taskKey);
            return zbrpc.report_preparation_task(scope.classInfo.zb_id,
                user.zb_id, scope.half_term,
                user.taskStats).then(function(response) {
                  scope.finished++;
                  return scope.checkResponse(response, user, taskKey);
                });
          };

          scope.getTaskSubIndexes = function() {
            return zbrpc.get_preclass_lessons(scope.classInfo.zb_id,
                scope.guanxiuTask.zb_course_id, scope.half_term)
                .then(function(response) {
                  var data = response.data.data;
                  var indexes = (data || []).map(function(lesson) {
                    return parseInt(lesson.lesson_id);
                  });
                  scope.guanxiuIndexes = indexes;
                  return true;
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

          scope.get_guanxiu_task = function() {
            for (var id in scope.tasks) {
              var task = scope.tasks[id];
              if (task.duration) return task;
            }
          };

          scope.report_guanxiu_task = function() {
            scope.guanxiuTask = scope.get_guanxiu_task();
            
            if (!scope.guanxiuTask) {
              return utils.truePromise();
            }

            scope.totalTasks = 0;
            scope.finished = 0;

            var requests = [
                scope.getTaskSubIndexes,
                scope.get_guanxiu_stats,
                scope.report_guanxiu_stats
            ];
            return utils.requestOneByOne(requests);
          };

          scope.get_guanxiu_stats = function() {
            var indexes = scope.guanxiuIndexes;
            if (indexes.length == 0) utils.truePromise();

            var start_time = indexes[0];
            var end_time = indexes[indexes.length - 1];
            
            return rpc.get_class_task_stats(scope.classId, scope.guanxiuTask.id,
                start_time, end_time, 1).then(function(response) {
                  response.data.forEach(function(user) {
                    scope.users[user.id].guanxiuStats = user.stats;
                  });
                  return true;
                });
          };
          
          scope.report_guanxiu_stats = function() {
            var taskKey = '观修';

            var requests = [];
            utils.forEach(scope.users, function(user) {
              var stats = user.guanxiuStats;
              if (utils.isEmpty(stats)) return;
              if (scope.checkUserTask(user, taskKey)) return;

              var record = scope.getTimedTaskRecords(stats,
                  scope.guanxiuIndexes);
              var nonZero = function(value) {return value != 0;};
              if (!utils.any(record.count, nonZero)) return;

              var request = function() {
                scope.statusText = '正在为"{0}"提交{1}半学期"{2}"任务记录...'.
                    format(user.name, ['上', '下'][scope.half_term % 2],
                        taskKey);

                return zbrpc.report_guanxiu_task(
                    scope.classInfo.zb_id, user.zb_id,
                    scope.half_term, record.count,
                    record.time).then(function(response) {
                      scope.finished++;
                      return scope.checkResponse(response, user, taskKey);
                    });
              };
              requests.push(request);
            });

            scope.totalTasks += requests.length;
            return utils.requestOneByOne(requests);
          };

          scope.report_jx_task = function() {
            var requests = [];
            utils.forEach(scope.users, function(user) {
              requests.push(function() {
                return scope.report_jx_task_for_user(user);
              });
            });

            scope.finished = 0;
            scope.totalTasks = requests.length;
            return utils.requestOneByOne(requests);
          };

          scope.get_preclass_lessons = function() {
            var half_term = scope.half_term;
            return zbrpc.get_preclass_lessons(scope.classInfo.zb_id,
                scope.get_zb_courseId(), half_term).then(function(response) {
                  scope.finished++;
                  scope.lessons = response.data.data;
                  return true;
                });
          };
          
          scope.report_attendance_for_user = function(user) {
            var taskKey = '出席';
            if (scope.checkUserTask(user, taskKey)) {
              return utils.truePromise();
            }

            var atts = scope.get_attendance(user);
            var records = scope.getBookAudioRecords(scope.lessons, user, true);
            var otherTasks = scope.classInfo.department_id == JIA_XING ?
              {} : (scope.users[user.id].taskStats || {});
            var half_term = scope.half_term;
            scope.statusText = '正在为"{0}"提交{1}半学期{2}记录...'.format(
                user.name, ['上', '下'][scope.half_term % 2], taskKey);
            return zbrpc.report_limited_schedule_task(
                scope.get_report_type(ATT_LIMIT_GRID),
                scope.classInfo.zb_id, user.zb_id, half_term, records.book,
                records.audio, atts[half_term % 2],
                otherTasks).then(function(response) {
                  scope.finished++;
                  return scope.checkResponse(response, user, taskKey);
                });
          };
          
          scope.getTasks = function() {
            return rpc.get_tasks(scope.classInfo.department_id)
                .then(function(response) {
                  return scope.tasks = utils.where(response.data,
                      function(task) {
                        return task.zb_name &&
                            task.starting_half_term <= scope.half_term;
                      });
                });
          };
          
          scope.getTaskStats = function(task, start_time, end_time) {
            return rpc.get_class_task_stats(scope.classId, task.id,
                start_time, end_time).then(function(response) {
                  var users = response.data || [];
                  users.forEach(function(user) {
                    var taskStats = scope.users[user.id].taskStats || {};
                    var parts = (task.zb_name || '').split('_');
                    var stat = user.stats[0] || {sum: 0, duration: 0};
                    if (parts.length == 2) {
                      var countKey = parts[0] + '_count';
                      if (!taskStats[countKey]) {
                        // Do not overwrite the existing value written with
                        // a different type (e.g. if fohao_count has value with
                        // fohao_type 0, do not reset it with fohao_type 1.
                        taskStats[countKey] = stat.sum;
                        taskStats[parts[0] + '_type'] = parts[1];
                      }
                    } else {
                      taskStats[task.zb_name + '_count'] = stat.sum;
                    }
                    if (task.duration) {
                      taskStats[task.zb_name + '_time'] = stat.duration;
                    }
                    scope.users[user.id].taskStats = taskStats;
                  });
                  return true; 
                });
          };

          /// Retrieves the last reporting time that was stored at the
          /// 'end_time' field for a schedule group.
          scope.getLastReportTime = function() {
            scope.lastReportTime = 0;

            return rpc.get_schedules(scope.classId,
                scope.scheduleGroup.term - 1).then(function(response) {
              var group = utils.first(response.data.groups);
              scope.lastReportTime = group && group.end_time;
              return true;
            });
          };

          /// Collects all task reports since last report.
          ///
          /// By default if there is no special reason the time is cut between
          /// dates like 06/16 00:00:00 and 12/16 00:00:00. Otherwise if a
          /// special time is previously cut (and saved), use that time.
          scope.getAllTaskStats = function() {
            var fistHalf = scope.half_term % 2 == 0;
            // A lot of people were not able to report their tasks
            // in time. Add this extra 15 days to avoid a zero number.
            var extraReportTime = 3600 * 24 * 15;

            var startTerm =
                utils.roundToDefaultStartTime(scope.scheduleGroup.start_time);
            var midTerm = utils.getMidTerm(scope.scheduleGroup) +
                extraReportTime;
            var endTerm = utils.roundToDefaultStartTime(scope.getEndTerm());

            var requests = [];
            utils.forEach(scope.tasks, function(task) {
              requests.push(function() {
                // Is this the first time to report the [task]?
                // For first time reporting, do not skip the first 15 days.
                var isFirstTime = task.starting_half_term == scope.half_term;
                var start_cut_time = scope.lastReportTime ||
                    (isFirstTime ? startTerm : (start_time + extraReportTime));
                var end_cut_time = scope.scheduleGroup.end_time ||
                    endTerm + extraReportTime;
                var start_time = fistHalf ? start_cut_time : midTerm;
                var end_time = fistHalf ? midTerm : end_cut_time;
                return scope.getTaskStats(task, start_time, end_time);
              });
            });
            return utils.requestOneByOne(requests);
          };
          
          scope.report_attendance = function() {
            scope.totalTasks = 0;
            scope.finished = 0;

            var requests = [
                scope.getTasks,
                scope.get_preclass_lessons,
                scope.getLastReportTime,
                scope.getAllTaskStats
            ];
            utils.forEach(scope.users, function(user) {
              requests.push(function() {
                return scope.report_attendance_for_user(user);
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
          scope.get_zb_courseId = function() {
            return {
              2: 2,
              3: 1,
              4: 3
            }[scope.classInfo.department_id];
          };
          
          /// Returns the 'type' field when reporting.
          ///
          /// grid 0: the main audio/book grid
          /// grid 1: the task/work grid
          /// grid 2: the limited class and attendance gird
          /// grid 4: the guanxiu grid
          scope.get_report_type = function(grid) {
            switch (scope.classInfo.department_id) {
            case 2:
              return ['rxl_grid', '', 'rxl_work_grid'][grid];
            case 3:
              return ['jx_grid', 'jxWork_grid', 'att_limit_grid',
                  'guanxiu_grid'][grid];
            case 4:
              return ['jt_grid', '', 'fohao_att_limit_grid'][grid];
            default:
              return null;
            };
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
                          scope.userCreated = true;
                          return scope.checkResponse(response, user, taskKey,
                              0);
                        });

                };
                requests.push(request);
              });
              scope.totalTasks += requests.length;
              scope.statusText = '正在上报用户信息...';

              return utils.requestOneByOne(requests).then(function() {
                if (!scope.userCreated) return true;

                return zbrpc.list_users(pre_classID).then(function(response) {
                  return scope.update_zb_ids(users, response.data.data);
                });
              });
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
            var courseId = scope.get_zb_courseId();
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
              if (parseInt(zb_user.status) == 11) return;
              zb_users_map[zb_user.name] = zb_user;
            });

            var requests = [];
            utils.forEach(users, function(user) {
              var zb_user = zb_users_map[user.name];
              if (!zb_user) return;

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
            var courseId = scope.get_zb_courseId();
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
                    return scope.sync_users().then(function(result) {
                      scope.deferredSyncClass.resolve(result);
                    });
                  }
                  alert('failed to create zhibei class.');
                  scope.deferredSyncClass.resolve(false);
                });
          };
          scope.cancel = function() {
            zbrpc.cancel();
          };

          scope.parse_serial_number = function(sn) {
            var prefix, index;
            var m = /(.+)-([0-9]+)/.exec(sn);
            if (m && m[2]) {
              prefix = m[1] + '-';
              index = parseInt(m[2]);
            } else {
              m = /([0-9]+)$/.exec(sn);
              if (!m || !m[1]) return null;

              index = parseInt(m[1]);
              prefix = sn.substring(0, sn.length - m[1].length);
            }
            
            return {prefix: prefix, index: index};
          };

          scope.allocate_serial_number = function() {
            var maxIndexes = {};

            utils.forEach(scope.users, function(user) {
              var sn = scope.parse_serial_number(user.internal_id);
              if (!sn) return;
              
              maxIndexes[sn.prefix] =
                  Math.max(maxIndexes[sn.prefix] || 0, sn.index);
            });

            var prefix = {
                2: 'C',
                3: 'A',
                4: 'B'
            }[scope.classInfo.department_id];
            prefix = (prefix || '') +
                (scope.classInfo.start_year % 100) + '-06-';

            var index = (maxIndexes[prefix] || 0);
            var nextSn = function() {
              index++;
              var sn = prefix + (index < 10 ? ('0' + index) : index);
              return rpc.get_users(null, null, sn).then(function(response) {
                return utils.isEmpty(response.data) ?
                    (scope.sn = sn) : nextSn();
              });
            };
            return nextSn();
          };
          scope.check_serial_numbers = function() {
            var requests = [];
            utils.forEach(scope.users, function(user) {
              if (user.internal_id) return;
              requests.push(scope.allocate_serial_number);
              requests.push(function() {
                user.internal_id = scope.sn;
                return rpc.update_user(user);
              });
            });
            return utils.requestOneByOne(requests);
          };
          scope.totalTasks = 0;
          scope.finished = 0;
          scope.results = {};
        },
        templateUrl: 'js/zb_sync_button/zb_sync_button.html'
      };
    });
});
