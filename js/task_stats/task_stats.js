define('task_stats/task_stats', ['progress_bar/progress_bar', 'services',
    'task_editor_dialog/task_editor_dialog',
    'task_history/task_history',
    'utils',
    'zb_services'
  ], function() {
  return angular.module('TaskStatsModule', ['ProgressBarModule',
      'ServicesModule', 'TaskEditorDialogModule',
      'TaskHistoryModule', 'UtilsModule'])
      .directive('taskStats', function(rpc, utils, zbrpc) {

      return {
        scope: {
          admining: '@',
          classId: '@'
        },
        link: function(scope) {
          scope.options = {};
          scope.pageSize = 8;

          var WORK_GRID = 1;
          var ATT_LIMIT_GRID = 2;

          var classInfo;
          var guanxiuTask;

          /// A map from zb lession id to bicw guanxiu index.
          /// e.g. for the following data from zhibei.info
          ///   {lesson_id: "59", name: "修法59"}, 
          ///   {lesson_id: "66", name: "修法73"}
          /// The map will have entries like:
          ///     guanxiuIndexes[59] = 59;
          ///     guanxiuIndexes[66] = 73;
          var guanxiuIndexes = {};

          scope.isJiaXing = function() {
            return classInfo && classInfo.department_id == 3;
          };

          function getTaskSubIndexes(half_term) {
            return function() {
              return zbrpc.get_preclass_lessons(classInfo.zb_id,
                  guanxiuTask.zb_course_id, half_term + 1)
                  .then(function(response) {
                    var data = response.data.data;
                    (data || []).map(function(lesson) {
                      var index = parseInt(lesson.name.replace(/[^0-9\.]+/g,'')) - 1;
                      guanxiuIndexes[lesson.lesson_id] = index;
                    });
                    return true;
                  });
            }
          }

          function parseZBGuanxiuStat(user) {
            var results = {};
            for (var key in user) {
              if (key.startsWith('count')) {
                var lession_id = parseInt(key.substring(5));
                if (!lession_id) continue;
                var index = guanxiuIndexes[lession_id];
                var result = (results[index] = (results[index] || {}));
                result.sum = user[key];
              } else if (key.startsWith('time')) {
                var lession_id = parseInt(key.substring(4));
                if (!lession_id) continue;
                var index = guanxiuIndexes[lession_id];
                var result = (results[index] = (results[index] || {}));
                result.time = (60 * user[key]);
              }
            }
            return results;
          }

          function getZBGuanxiuStats(halfTerm) {
            return function() {
              if (!scope.isJiaXing()) return utils.truePromise();
              return zbrpc.get_guanxiu_tasks(classInfo.zb_id, halfTerm + 1)
                  .then(function(response) {
                    classInfo.task_stats = classInfo.task_stats || {};
                    var stats = response.data.data;
                    (stats || []).forEach(function(stat) {
                      var localStat = classInfo.task_stats[stat.userID] = (classInfo.task_stats[stat.userID] || {});
                      localStat.guanxiuStats = utils.mix_in(localStat.guanxiuStats || {},
                          parseZBGuanxiuStat(stat));
                    });
                    return true;
                  });
            }
          }

          function getZBTaskStats(halfTerm) {
            return function() {
              var grid = zbrpc.get_report_type(classInfo.department_id, WORK_GRID);
              grid = grid ||
                  zbrpc.get_report_type(classInfo.department_id, ATT_LIMIT_GRID);
              var pre_classID = classInfo.zb_id;
              return zbrpc.get_task_records(grid, pre_classID, halfTerm + 1)
                  .then(function(response) {
                var stats = response.data.data;
                classInfo.task_stats = classInfo.task_stats || {};
                var users = utils.toMap(scope.task_stats, 'zb_id');
                (stats || []).forEach(function(stat) {
                  var user = users[stat.userID];
                  if (!user) return;

                  user.zbTerms = user.zbTerms || {};
                  user.zbTerms[halfTerm + 1] = stat;
                  user.zbLastTerm = stat;

                  var guanxiu = classInfo.task_stats[stat.userID];
                  user.guanxiuStats = guanxiu && guanxiu.guanxiuStats;
                  classInfo.task_stats[stat.userID] = user;
                });
                return true;
              });
            };
          };

          scope.getZbData = function() {
            if (!scope.options.showZBdata || classInfo.task_stats) return;

            var halfTerms = Array.apply(null, {length: 17}).map(Number.call, Number);
            var requests = [zbrpc.ensure_authenticated];
            requests = requests.concat(halfTerms.map(getTaskSubIndexes));
            requests = requests.concat(halfTerms.map(getZBGuanxiuStats));
            requests = requests.concat(halfTerms.map(getZBTaskStats));
            utils.requestOneByOne(requests);
          };

          /// Returns wehther the guanxiu task has inconistent number between
          /// the local and the remote (zhibei.info) data.
          scope.hasProblem = function(user, subIndex) {
            if (!scope.options.showZBdata || !user.stats || !user.guanxiuStats) {
              return false;
            }
            var stat = user.stats[subIndex];
            var zbStat = user.guanxiuStats[subIndex];
            return ((stat && stat.sum || 0) != (zbStat && zbStat.sum || 0)) ||
                (utils.toGuanxiuHour(stat && stat.duration || 0) != 
                    utils.toGuanxiuHour(zbStat && zbStat.time || 0));
    };

          /// Returns whether the selected task has inconsistent number between
          /// the local and the remove (zhibei.info) data.
          scope.taskHasProblem = function(user) {
            return user.stats[0].sum !=
                (user.zbLastTerm && user.zbLastTerm[scope.selectedTask.zb_name + '_total']);
          };

          scope.refreshStats = function() {
            if (!scope.selectedTask) return;

            scope.pages = [];
            var totalPages = scope.selectedTask.sub_tasks / scope.pageSize;
            for (var i = 0;i < totalPages; i++) {
              scope.pages.push(i);
            }

            rpc.get_class_task_stats(scope.classId, scope.selectedTask.id)
                .then(function(response) {
                  scope.task_stats = response.data;
                  utils.forEach(scope.task_stats, function(user) {
                    if (parseInt(scope.selectedTask.sub_tasks)) {
                      var zbStat = classInfo.task_stats && classInfo.task_stats[user.zb_id];
                      if (zbStat) {
                        user.guanxiuStats = zbStat.guanxiuStats;
                      }
                    } else {
                      user.stats[0] = user.stats[0] || user.stats[1];
                      var zbStat = classInfo.task_stats && classInfo.task_stats[user.zb_id];
                      if (zbStat) {
                        user.zbTerms = zbStat.zbTerms;
                        user.zbLastTerm = zbStat.zbLastTerm;
                      }
                    }
                  });
                });
          };

          scope.$on('task-reported', function() {
            scope.refreshStats();
          });

          scope.reload = function() {
            scope.options = {};
            if (!parseInt(scope.classId)) {
              scope.tasks = {};
              scope.task_stats = {};
              return;
            }

            classInfo = window.classInfos[scope.classId];
            if (!classInfo) return;

            rpc.get_tasks(classInfo.department_id).then(function(response) {
              scope.tasks = response.data;
              utils.any(scope.tasks, function(task) {
                return task.duration && (guanxiuTask = task);
              });
              scope.selectedTask = utils.first(scope.tasks);
            });
          };
          
          scope.$watch('classId', function() {
            scope.reload();
          });
          scope.$watch('selectedTask', function() {
            scope.refreshStats();
          });
          scope.range = function() {
            var arr = [];
            var start = scope.currentPage, end = start + scope.pageSize;
            for (var i = start; i < end; i++) arr[i-start] = i;
            return arr;
          };
          scope.page = function(delta) {
            scope.currentPage += delta * scope.pageSize;
            var max = scope.selectedTask.sub_tasks - scope.pageSize;
            if (scope.currentPage > max) scope.currentPage = max;
            else if (scope.currentPage < 0) scope.currentPage = 0;
          };
          scope.reportTask = function(user) {
            var data = {
                student_id: user.id,
                task_id: scope.selectedTask.id,
                count: user.count,
                sub_index: user.sub_index - 1,
                duration: user.duration || 0,
                half_term: $scope.half_term
              };

            if (!utils.validateTaskInput(scope.selectedTask, data)) return;

            rpc.report_task(data).then(function (response) {
              scope.refreshStats();
            });
          };
          scope.select = function(user) {
            scope.selectedUser = utils.mix_in({classId: scope.classId}, user);
          };
          scope.selected = function(user) {
            return scope.selectedUser && scope.selectedUser.id == user.id;
          };
          scope.gotoPage = function(page) {
            scope.currentPage = page * scope.pageSize;
          };
          scope.expand = function() {
            var dialog = document.querySelector('#task-editor-dlg');
            dialog.open();
          };
          scope.currentPage = 0;
        },
        templateUrl: 'js/task_stats/task_stats.html?tag=201905162201'
      };
    });
});
