define('task_history/task_history', ['utils',
    'services'], function() {
  return angular.module('TaskHistoryModule', ['UtilsModule',
      'ServicesModule']).directive('taskHistory',
      function(utils, rpc) {
    return {
      scope: {
        hideTaskList: '@',
        selectedTask: '=',
        user: '='
      },
      restrict: 'E',
      link: function(scope, element, attrs) {
        scope.$watch('user', function() {
          if (!scope.user) return;

          if (scope.user.classInfo) {
            var depId = scope.user.classInfo.department_id;
            rpc.get_tasks(depId).then(function(response) {
              scope.tasks = response.data;
              scope.selectedTask = utils.first(scope.tasks);
            });
          } else if (scope.selectedTask) {
            reloadTaskHistory();
          }
        });

        scope.$watch('selectedTask', function() {
          if (!scope.selectedTask || !scope.user) return;

          reloadTaskHistory();
        });

        var scheduleGroups;

        function getScheduleGroups() {
          return rpc.get_schedule_groups(scope.user.classId)
              .then(function(response) {
            scheduleGroups = response.data;
            scheduleGroups.sort(function(a, b) {
              return parseInt(a.term) - parseInt(b.term);
            });
            return scheduleGroups;
          });
        }

        function getTaskHistory() {
          return rpc.get_task_history(scope.user.id, scope.selectedTask.id)
              .then(function(response) {
            scope.task_history = response.data;
            var sum = 0;
            var totalDuration = 0;
            for (var index = 0; index < scope.task_history.length; index++) {
              var record = scope.task_history[index];
              record.count = parseInt(record.count);
              record.duration = parseInt(record.duration);
              record.sub_index = parseInt(record.sub_index);
              record.sum = (sum += record.count);
              record.totalDuration = (totalDuration += record.duration);
            }
            scope.buildHistogram();
            addTermSummaries();
            return scope.task_history;
          });
        };

        function addTermSummaries() {
          if (scope.selectedTask.duration || !scheduleGroups.length) {
            scope.expanded = true;
            return;
          }

          var termIndex = 0;
          var scheduleGroup = scheduleGroups[termIndex++];
          scheduleGroup.sum = 0;

          var history = [];
          for (var index = 0; index < scope.task_history.length; index++) {
            var record = scope.task_history[index];
            while (!scheduleGroup.end_time ||
                scheduleGroup.end_time < record.ts) {
              if (scheduleGroup.sum) {
                scheduleGroup.id = 0;
                scheduleGroup.ts = '第{0}学期'.format(scheduleGroup.term);
                history.push(scheduleGroup);
              }
              scheduleGroup = scheduleGroups[termIndex++];
              if (!scheduleGroup) {
                for (; index < scope.task_history.length; index++) {
                  history.push(scope.task_history[index]);
                }
                scope.task_history = history;
                return;
              }
              scheduleGroup.sum = 0;
            }
            scheduleGroup.sum += record.count;
            history.push(record);
          }
          if (scheduleGroup && scheduleGroup.sum) {
            scheduleGroup.id = 0;
            scheduleGroup.ts = '第{0}学期'.format(scheduleGroup.term);
            history.push(scheduleGroup);
          }
          scope.task_history = history;
        }

        function reloadTaskHistory() {
          utils.requestOneByOne([getScheduleGroups, getTaskHistory]);
        };

        scope.remove = function(record) {
          var message = scope.selectedTask.duration ? ',用时:{2}]' : ']';
          message = ('您确认要删除这条记录吗？[时间:{0},数量:{1}' + message)
              .format(record.ts, record.count, record.duration);
          if (!confirm(message)) return;
          rpc.remove_task_record(record.id).then(function(response) {
            if (response.data.deleted) {
              reloadTaskHistory();
            }
          });
        };

        scope.buildHistogram = function() {
          scope.histogram = [];
          if (!(scope.task_history instanceof Array) ||
              !scope.task_history.length) return;

          var sum = 0;
          var values = [], cutOff;
          if (scope.selectedTask.duration) {
            scope.task_history.forEach(function(record) {
              values[record.sub_index] =
                  (values[record.sub_index] || 0) + record.duration;
              sum += record.duration;
            });
            cutOff = Math.round(1.5 * sum / values.length);
            for (var index = 0;index < values.length; index++) {
              var value = values[index] || 0;
              scope.histogram.push(['' + (index + 1), Math.min(cutOff, value)]);
            }
          } else {
            values = scope.task_history.map(function(record) {
              sum += record.count;
              return record.count;
            });
            values.sort();
            // Use median * 1.5 as cut off.
            cutOff = Math.round(1.5 * values[Math.round(values.length / 2)]);
            scope.histogram = scope.task_history.map(function(record) {
              return [record.ts, Math.min(cutOff, record.count)];
            });
          }

          scope.sum = sum;
          scope.chartOptions = '{"vAxis": {"minValue": 0, "maxValue": {0}}}'.
              format(cutOff);
        };
      },
      templateUrl : 'js/task_history/task_history.html?tag=20180911'
    };
  });
});

