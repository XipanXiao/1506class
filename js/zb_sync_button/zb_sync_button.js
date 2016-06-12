define('zb_sync_button/zb_sync_button',
    ['progress_bar/progress_bar', 'services', 'utils', 'zb_api',
     'zb_services'], function() {
  return angular.module('ZBSyncButtonModule', ['ProgressBarModule',
      'ServicesModule', 'UtilsModule', 'ZBAPIModule', 'ZBServicesModule'])
      .directive('zbSyncButton', function($q, rpc, utils, zbapi, zbrpc) {
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
                  scope.scheduleGroup.term * 2);
            });
          });
          scope.sync = function() {
            if (scope.inprogress()) return;

            var half_terms = scope.getHalfTerms().length;
            if (half_terms == 0) return;

            utils.requestOneByOne([
                scope.ensure_authenticated,
                scope.report_schedule_task,
                scope.report_jx_task,
                scope.report_guanxiu_task]);
          };
          
          scope.getUserRecords = function(user) {
            var index = 0;
            var group = scope.scheduleGroup;
            var audio = [];
            var book = [];
            var half = 11;// 11 + 12 = 23 weeks.

            for (var id in group.schedules) {
              var schedule = group.schedules[id];
              if (!parseInt(schedule.course_id)) continue;
              var record = user.records[schedule.course_id];
              audio[index] = (record && record.video) ? 1 : 0;
              book[index] = (record && record.text) ? 1 : 0;
              index++;
            }
            
            return [
              {audio: audio.slice(0, half), book: book.slice(0, half)},
              {audio: audio.slice(half), book: book.slice(half)}
            ];
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
            var half_terms = scope.getHalfTerms();
            var half_term_base = scope.scheduleGroup.term * 2;
            var users = scope.users;

            var requests = [];
            scope.statusText = '正在提交听传承和读法本记录...';
            half_terms.forEach(function(half_term) {
              for (var id in users) {
                var user = users[id];
                var request = function() {
                  var records = scope.getUserRecords(user);
                  var reportPromise = zbrpc.report_schedule_task(
                      parseInt(scope.classInfo.zb_id), parseInt(user.zb_id),
                      half_term_base + half_term, records[half_term].book,
                      records[half_term].audio).then(function(response) {
                        scope.finished++;
                        return response.data.returnValue == 'success';
                      });
                  return reportPromise;
                };
                requests.push(request);
              }
            });
            scope.totalTasks += requests.length;
            return utils.requestOneByOne(requests);
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
          scope.login = function() {
            var username = document.querySelector('#zb-username').value;
            var password = document.querySelector('#zb-password').value;
            var editPassword = document.querySelector('#zb-editpassword').value;

            zbrpc.login(username, password).then(function(response) {
              if (zbrpc.is_showing_login_form(response.data)) {
                alert('登录失败');
              } else {
                zbrpc.edit(editPassword).then(function(approved) {
                  approved ? 
                      scope.deferredLogin.resolve() :
                      scope.deferredLogin.reject();
                });
              }
            });
          };

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

                    var request = function() {
                      var record = {};
                      record[task.zb_name + '_count'] = user.stats[0].sum;
                      var promise = zbrpc.report_preparation_task(
                          scope.classInfo.zb_id, user.zb_id,
                          half_term, record).then(function() {
                            scope.finished++;
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

                          var record = scope.getTimedTaskRecords(user.stats,
                              indexes);
                          var nonZero = function(value) {return value != 0;};
                          if (!utils.any(record.count, nonZero)) return;

                          var request = function() {
                            var promise = zbrpc.report_guanxiu_task(
                                scope.classInfo.zb_id, user.zb_id,
                                half_term, record.count,
                                record.time).then(function() {
                                  scope.finished++;
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
              return $q.all(promises);
            });
          };
          
          scope.inprogress = function() {
            return scope.finished < scope.totalTasks; 
          };
          
          scope.totalTasks = 0;
          scope.finished = 0;
        },
        templateUrl: 'js/zb_sync_button/zb_sync_button.html'
      };
    });
});
