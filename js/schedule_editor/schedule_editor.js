define('schedule_editor/schedule_editor',
    ['course_editor_dialog/course_editor_dialog',
     'editable_label/editable_label',
    'schedule_group_editor/schedule_group_editor', 'services',
    'user_picker/user_picker', 'utils'], function() {

  return angular.module('ScheduleEditorModule',
      ['CourseEditorDialogModule', 'EditableLabelModule',
       'ScheduleGroupEditorModule', 'ServicesModule', 'UserPickerModule',
       'UtilsModule']).directive('scheduleEditor', function(rpc, utils) {
          return {
            scope: {
              classId: '='
            },
            link: function($scope) {
              $scope.week = 1000*3600*24*7;
              
              $scope.getWeeklyTime = function(group, index) {
                return utils.getWeeklyTime(group.start_time, index);
              };
              
              $scope.$watch('classId', function() {
                if (!$scope.classId) return;
                $scope.loadSchedules();
              });
              
              $scope.loadSchedules = function() {
                return rpc.get_schedules($scope.classId)
                    .then(function(response) {
                  $scope.schedule_groups = response.data.groups;
                  $scope.users = {};
                  for (var id in response.data.users) {
                    $scope.users[id] = response.data.users[id].name;
                  }
                  
                  $scope.schedule_groups[0] = {
                    id: 0,
                    classId: $scope.classId,
                    course_group: 0,
                    name: '新的学修安排模板',
                    start_time: utils.unixTimestamp(utils.getDefaultStartTime())
                  };

                  return $scope.schedule_groups;
                });
              };
              
              $scope.update = function(schedule, key, value) {
                schedule[key] = value;
                rpc.update_schedule(schedule);
              };
              $scope.editGroup = function(group) {
                group.editing = true;
              };
              $scope.removeGroup = function(group) {
                if (group.schedules &&
                    utils.positiveKeys(group.schedules).length > 0) {
                  alert('要先删除每节安排，才能删除该组');
                  return;
                }
                
                rpc.remove_schedule_group(group.id).then(function(response) {
                  if (parseInt(response.data.deleted)) $scope.loadSchedules();
                });
              };
              $scope.remove = function(schedule) {
                rpc.remove_schedule(schedule.id).then(function(response) {
                  if (parseInt(response.data.deleted)) $scope.loadSchedules();
                });
              };
              $scope.vacation = function(schedule) {
                return !schedule.course_id || !parseInt(schedule.course_id);
              };
            },
            templateUrl : 'js/schedule_editor/schedule_editor.html'
          };
        });
});
