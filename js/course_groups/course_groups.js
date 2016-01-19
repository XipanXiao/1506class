define(['permission', 'services', 'utils'],
    function() {
  return angular.module('CourseGroupsModule', ['PermissionModule',
      'ServicesModule', 'UtilsModule'])
    .directive('courseGroups', function(perm, rpc, utils) {
      return {
        scope: {
          departmentId: '@',
          groupId: '=',
          listType: '@'
        },
        link: function($scope) {
          rpc.get_course_groups().then(function(response) {
            $scope.currentGroup = {
              id: groupId
            };
            $scope.course_groups = response.data;
            $scope.groupIds = utils.keys($scope.course_groups);
          });
          
          $scope.select = function(id) {
            $scope.groupId = id;
          };
        },
        templateUrl : 'js/course_groups/course_groups.html'
      };
    });
});
