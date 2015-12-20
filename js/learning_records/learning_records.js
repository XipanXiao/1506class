define(['services'], function() {
  return angular.module('LearningRecordsModule', ['ServicesModule'])
    .controller('LearningRecordsController', function($scope, $attrs, rpc) {
      $scope.attendOptions = ['缺席', '出席', '请假'];
      $scope.$on('class-selected', function(event, classInfo) {
        rpc.get_learning_records(classInfo.id).then(function(response) {
          $scope.schedules_groups = response.data;
          $scope.attendence = $attrs.attendence;
        });
      });
      
      $scope.reportTask = function(user, schedule_id) {
        var schedule = user.records[schedule_id];
        schedule.student_id = user.id;
        schedule.id = schedule_id;
        rpc.report_schedule_task(schedule);
      };
    })
    .directive('learningRecords',
        function() {
          return {
            templateUrl : 'js/learning_records/learning_records.html'
          };
        });
});
