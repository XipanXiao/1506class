define(['services'], function() {
  return angular.module('LearningRecordsModule', ['ServicesModule'])
    .controller('LearningRecordsController', function($scope, $attrs, rpc) {
      $scope.attendOptions = ['缺席', '出席', '请假'];
      $scope.$on('class-selected', function(event, classInfo) {
        rpc.get_learning_records(classInfo.id).then(function(response) {
          $scope.schedules_groups = response.data.groups;
          $scope.users = response.data.users;
          $scope.attendence = $attrs.attendence;
        });
      });
      
      $scope.reportTask = function(user, course_id) {
        var record = user.records[course_id];
        record.student_id = user.id;
        record.course_id = course_id;
        rpc.report_schedule_task(record);
      };
    })
    .directive('learningRecords',
        function() {
          return {
            templateUrl : 'js/learning_records/learning_records.html'
          };
        });
});
