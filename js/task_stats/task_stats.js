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

          scope.isJiaXing = function() {
            return classInfo && classInfo.department_id == 3;
          };

          function getZBTaskStats(halfTerm) {
            return function() {
              var grid = zbrpc.get_report_type(classInfo.department_id, WORK_GRID);
              grid = grid ||
                  zbrpc.get_report_type(classInfo.department_id, ATT_LIMIT_GRID);
              var pre_classID = classInfo.zb_id;
              return zbrpc.get_task_records(grid, pre_classID, halfTerm + 1)
                  .then(function(response) {
                var stats = response.data.data;
                var users = utils.toMap(scope.task_stats, 'zb_id');
                (stats || []).forEach(function(stat) {
                  var user = users[stat.userID];
                  if (!user) return;

                  user.zbTerms = user.zbTerms || {};
                  user.zbTerms[halfTerm + 1] = stat;
                  user.zbLastTerm = stat;
                });
                return true;
              });
            };
          };

          function done() {
            classInfo.zbTaskLoaded = true;
            return utils.truePromise();
          }

          scope.getZbData = function() {
            if (!scope.options.showZBdata || classInfo.zbTaskLoaded) return;

            var halfTerms = Array.apply(null, {length: 17}).map(Number.call, Number);
            var requests = [zbrpc.ensure_authenticated];
            requests = requests.concat(halfTerms.map(getZBTaskStats));
            requests.push(done);
            utils.requestOneByOne(requests);
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
                  if (!parseInt(scope.selectedTask.sub_tasks)) {
                    utils.forEach(scope.task_stats, function(user) {
                      user.stats[0] = user.stats[0] || user.stats[1];
                    });
                  }
                });
          };

          scope.$on('task-reported', function() {
            scope.refreshStats();
          });

          scope.reload = function() {
            if (!parseInt(scope.classId)) {
              scope.tasks = {};
              scope.task_stats = {};
              return;
            }

            rpc.get_classes(scope.classId).then(function(response) {
              classInfo = response.data[scope.classId];
              if (!classInfo) return;

              rpc.get_tasks(classInfo.department_id).then(function(response) {
                scope.tasks = response.data;
                scope.selectedTask = utils.first(scope.tasks);
              });
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
                duration: user.duration || 0
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
