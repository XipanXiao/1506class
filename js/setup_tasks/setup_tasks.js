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
        },
        templateUrl: 'js/setup_tasks/setup_tasks.html'
      };
    });
});
