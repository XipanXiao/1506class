define('task_history/task_history', ['utils',
    'services'], function() {
  return angular.module('TaskHistoryModule', ['UtilsModule',
      'ServicesModule']).directive('taskHistory',
      function(utils, rpc) {
    return {
      scope: {
        hideTaskList: '@',
        selectedTask: '=',
        showZbData: '=',
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

        /// Returns the sum of the first half and second half counts of
        /// the [term].
        function calcZBTermSum(term) {
          if (!scope.user.zbTerms) return 0;

          var taskKey = scope.selectedTask.zb_name + '_count';
          var firstHalf = scope.user.zbTerms[term * 2];
          var secondHalf = scope.user.zbTerms[term * 2 + 1];
          return (firstHalf && firstHalf[taskKey] || 0) +
              (secondHalf && secondHalf[taskKey] || 0);
        }

        function getZbTotal() {
          if (!scope.user.zbLastTerm) return 0;
          var taskKey = scope.selectedTask.zb_name + '_total';
          return scope.user.zbLastTerm[taskKey];
        }

        /// Given n terms each having an end_time stamp,
        /// returns n+1 time ranges paritioned by them.
        function splitRanges(terms) {
          var maxvalue = '9999-12-31 23:59:59';
          var start = 0;
          var count = 0;
          var ranges = terms.map(function(term) {
            count++;
            var range = {
              sum: 0,
              zbSum: calcZBTermSum(term.term),
              start: start, 
              end: term.end_time || maxvalue, 
              ts: '第{0}学期'.format(term.term)
            };
            start = range.end;
            return range;
          });
          if (start == maxvalue) return ranges;

          ranges.push({
            sum: 0,
            start: start, 
            end: 9007199254740991,
            ts: '第{0}学期'.format(count+1)
          });
          return ranges;
        }

        /// Converts time [range] to index range, searching from [pos].
        function sumRange(records, range, pos) {
          while(pos < records.length && records[pos].ts < range.start) pos++;
          if (pos == records.length) {
            range.start = range.end = pos;
            return range;
          }

          range.start = pos;
          while(pos < records.length && records[pos].ts < range.end) {
            range.sum += records[pos++].count;
          }
          range.end = pos;
          return range;
        }

        /// Partitions the [records] list into aggregated segements,
        /// based on [terms].
        ///
        /// Each term has an ending time stamp. These
        /// n time stamp values, together with -infty
        /// and +infty, partitions the whole time line
        /// into n+1 ranges. Each range has an aggregated
        /// record, whose value is the summation of records
        /// falling in the range.
        function aggregateRecords(records, terms) {
          var pos = 0;
          var ranges = splitRanges(terms);
          ranges = ranges.map(function(range) {
            range = sumRange(records, range, pos);
            pos = range.end;
            return range;
          });
          ranges.reverse().forEach(function(range) {
            records.splice(range.end, 0, range);
          });
          records.push({
            ts: '总计',
            sum: ranges.reduce(function(total, range) {
              return total + range.sum;
            }, 0),
            zbSum: getZbTotal()
          });
        }

        function addTermSummaries() {
          if (scope.selectedTask.duration || !scheduleGroups.length) {
            scope.expanded = true;
            return;
          }
          aggregateRecords(scope.task_history, scheduleGroups);
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
      templateUrl : 'js/task_history/task_history.html?tag=20190911'
    };
  });
});

