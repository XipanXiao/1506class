define('setup_tasks/setup_tasks',
    ['bit_editor/bit_editor', 'services', 'utils'], function() {
  return angular.module('SetupTasksModule', ['BitEditorModule',
      'ServicesModule', 'UtilsModule'])
      .directive('setupTasks', function($rootScope, rpc, utils) {
      return {
        scope: {
          user: '='
        },
        link: function(scope) {
          scope.updateEnroll = function() {
            var user = scope.user;
            rpc.update_user({id: user.id, enroll_tasks: user.enroll_tasks});
          };
          rpc.get_classes(null, true).then(function(response) {
            scope.classes = response.data;
            scope.classIds = utils.keys(scope.classes);
          });
          rpc.get_departments().then(function(response) {
            scope.departments = response.data;
          });
          rpc.get_class_prefs().then(function(response) {
            scope.class_pref = response.data[scope.user.id];
            if (utils.isEmpty(scope.class_pref)) {
              scope.class_pref = {};
            }
          });
          scope.update_pref = function() {
            rpc.update_class_prefs(scope.class_pref);
          };
          scope.getClassLabel = function(id) {
            var classInfo = scope.classes[id];
            var dayLabels = ['星期日', '星期一', '星期二', '星期三', '星期四',
                               '星期五', '星期六'];
            
            return scope.departments[classInfo.department_id].name +
                (dayLabels[classInfo.weekday] || '') + (classInfo.time || '');
          };
          
        },
        templateUrl: 'js/setup_tasks/setup_tasks.html'
      };
    });
});
