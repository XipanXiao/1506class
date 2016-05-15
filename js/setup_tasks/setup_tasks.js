define('setup_tasks/setup_tasks', ['services', 'utils'],
    function() {
  return angular.module('SetupTasksModule', ['ServicesModule', 'UtilsModule'])
      .directive('setupTasks', function($rootScope, rpc, utils) {
      return {
        scope: {
          user: '='
        },
        link: function(scope) {
          scope.updateEnroll = function() {
            var user = scope.user;
            utils.encodeTaskBits(user);
            rpc.update_user({id: user.id, enroll_tasks: user.enroll_tasks});
          };

          utils.decodeTaskBits(scope.user);
        },
        templateUrl: 'js/setup_tasks/setup_tasks.html'
      };
    });
});
