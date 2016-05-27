define('schedule_tasks/schedule_tasks', ['navigate_bar/navigate_bar',
    'services', 'utils'], function() {
  return angular.module('ScheduleTasksModule', ['NavigateBarModule',
    'ServicesModule', 'UtilsModule'])
    .directive('scheduleTasks', function(rpc, utils) {
          return {
            scope: {
              user: '='
            },
            link: function($scope) {
              $scope.attendOptions = ['缺席', '出席', '请假'];
              $scope.vacation = function(schedule) {
                return !parseInt(schedule.course_id); 
              };

              $scope.getWeeklyTime = function(group, index) {
                return utils.getWeeklyTime(group.start_time, index);
              };
              
              $scope.$watch('user', function() {
                if (!$scope.user) return;

                rpc.get_schedules($scope.user.classId, 'mine')
                    .then(function(response) {
                  $scope.schedule_groups = response.data.groups;
                  $scope.users = response.data.users;
                  $scope.records = $scope.users[$scope.user.id].records;
                });
              });
              
              $scope.reportTask = function (schedule) {
                var record = $scope.records[schedule.course_id];
                record.course_id = schedule.course_id;
                rpc.report_schedule_task(record);
              };
              
              /// Check whether the schedule group is in the time frame of the
              /// current selected term.
              $scope.isCurrentGroup = function(group) {
                var diff = utils.unixTimestamp($scope.currentTerm) -
                  group.start_time;
                // A group is considered in the time frame if its start time
                // is within a 4 weeks interval of the start time of the term.
                return Math.abs(diff) < 60 * 60 * 24 * 14;
              };
              
              $scope.navigate = function(direction) {
                var firstGroup, lastGroup;
                switch (direction) {
                case -2:
                  firstGroup = utils.first($scope.schedule_groups);
                  $scope.currentTerm = utils.toDateTime(firstGroup.start_time);
                  break;
                case +2:
                  lastGroup = utils.last($scope.schedule_groups);
                  $scope.currentTerm = utils.toDateTime(lastGroup.start_time);
                  break;
                case -1:
                  firstGroup = utils.first($scope.schedule_groups);
                  if ($scope.isCurrentGroup(firstGroup)) break;
  
                  $scope.currentTerm =
                    utils.nextTerm($scope.currentTerm, direction);
                  break;
                case +1:
                  lastGroup = utils.last($scope.schedule_groups);
                  if ($scope.isCurrentGroup(lastGroup)) break;

                  $scope.currentTerm =
                      utils.nextTerm($scope.currentTerm, direction);
                  break;
                default:
                  $scope.currentTerm = utils.getDefaultStartTime();
                }
              };
              
              $scope.currentTerm = utils.getDefaultStartTime();
            },
            templateUrl : 'js/schedule_tasks/schedule_tasks.html'
          };
        });
});
