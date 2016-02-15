define('learning_records/learning_records', ['services'], function() {
  return angular.module('LearningRecordsModule', ['ServicesModule'])
    .directive('learningRecords',
        function(rpc) {
          return {
            scope: {
              attendence: '@',
              classId: '='
            },
            link: function($scope) {
              $scope.attendOptions = ['缺席', '出席', '请假'];

              $scope.$watch('classId', function() {
                rpc.get_schedules($scope.classId, 'class')
                    .then(function(response) {
                  $scope.schedule_groups = response.data.groups;
                  $scope.users = response.data.users;
                });
              });
              
              $scope.reportTask = function(user, course_id) {
                var record = user.records[course_id];
                record.student_id = user.id;
                record.course_id = course_id;
                rpc.report_schedule_task(record);
              };
            },
            templateUrl : 'js/learning_records/learning_records.html'
          };
        });
});
