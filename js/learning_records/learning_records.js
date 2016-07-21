define('learning_records/learning_records', [
    'navigate_bar/navigate_bar', 'services', 'utils',
    'zb_sync_button/zb_sync_button'], function() {
  return angular.module('LearningRecordsModule', ['NavigateBarModule',
      'ServicesModule',
      'UtilsModule',
      'ZBSyncButtonModule'])
    .directive('learningRecords',
        function(rpc, utils) {
          return {
            scope: {
              attendence: '@',
              classId: '='
            },
            link: function($scope) {
              $scope.attendOptions = ['缺席', '出席', '请假'];
              $scope.vacation = function(schedule) {
                return !parseInt(schedule.course_id); 
              };

              $scope.$watch('classId', function() {
                rpc.get_schedules($scope.classId, 'class')
                    .then(function(response) {
                  $scope.schedule_groups = response.data.groups;
                  $scope.users = response.data.users;
                  $scope.initCurrentTerm();
                });
              });
              
              $scope.reportTask = function(user, course_id) {
                var record = user.records[course_id];
                record.student_id = user.id;
                record.course_id = course_id;
                rpc.report_schedule_task(record);
              };

              /// Check whether the schedule group is in the time frame of the
              /// current selected term.
              $scope.isCurrentGroup = function(group) {
                if (!$scope.currentTerm) return false;

                var diff = utils.unixTimestamp($scope.currentTerm) -
                  group.start_time;
                // A group is considered in the time frame if its start time
                // is within a 4 weeks interval of the start time of the term.
                return Math.abs(diff) < 60 * 60 * 24 * 14;
              };
              
              $scope.navigate = function(direction) {
                if (utils.isEmpty($scope.schedule_groups)) return;

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
                  $scope.initCurrentTerm();
                }
              };
              
              $scope.initCurrentTerm = function() {
                var date = utils.getDefaultStartTime();
                $scope.currentTerm = utils.nextTerm(date, -1);

                var current = function(group) {
                  return $scope.isCurrentGroup(group);
                };
                if (!utils.any($scope.schedule_groups, current)) {
                  $scope.navigate(2);
                }
              };
            },
            templateUrl : 'js/learning_records/learning_records.html'
          };
        });
});
