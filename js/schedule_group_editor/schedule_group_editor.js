define('schedule_group_editor/schedule_group_editor',
    ['course_groups/course_groups', 'timestamp/timestamp',
    'services', 'utils'], function() {

  return angular.module('ScheduleGroupEditorModule',
      ['CourseGroupsModule', 'TimestampModule', 'ServicesModule',
       'UtilsModule']).directive('scheduleGroupEditor',
        function($rootScope, rpc, utils) {
          return {
            scope: {
              dep: '=',
              group: '='
            },
            link: function(scope) {
              scope.saveGroup = function(group) {
                if (!parseInt(group.term)) {
                  alert('请选择学期');
                  return;
                }
                rpc.update_schedule_group(group).then(function(response) {
                  if (parseInt(response.data.updated)) {
                    group.editing = false;
                    scope.reloadGroup(group.term);
                  }
                });
              };
              
              scope.reloadGroup = function(term) {
                $rootScope.$broadcast('reload-schedules', term);
              };

              scope.limitedGroupChange = function(courses) {
                scope.group.limited_courses = courses;
              };
              scope.terms = (function() {
                var terms = [];
                for (var index = 1;index <= utils.totalTerms; index++)
                  terms.push(index);
                return terms;
              })();
            },
            templateUrl : 'js/schedule_group_editor/schedule_group_editor.html?tag=201903302243'
          };
        });
});
