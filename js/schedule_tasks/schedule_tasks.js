define(['services', 'utils'], function() {
  return angular.module('ScheduleTasksModule', ['ServicesModule',
    'UtilsModule']).directive('scheduleTasks', function(rpc, utils) {
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
            },
            templateUrl : 'js/schedule_tasks/schedule_tasks.html'
          };
        });
});
