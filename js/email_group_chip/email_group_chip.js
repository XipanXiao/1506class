define('email_group_chip/email_group_chip', ['services', 'utils'], function() {
  return angular.module('EmailGroupChipModule', ['ServicesModule', 'UtilsModule'])
      .directive('emailGroupChip', function(rpc, utils) {
    return {
      scope: {
        classInfo: '=',
        group: '=',
        remove: '&'
      },
      link: function(scope, element) {
        scope.toggleExpand = function() {
          scope.expanded = !scope.expanded;
        };
        scope.removeUser = function(user) {
            delete scope.classInfo.users[user.id];
            classInfo.user_count = utils.keys(classInfo.users).length;
        };
        scope.$watch('classInfo', function(classInfo) {
          if (!classInfo) return;
          scope.group = classInfo;
          if (classInfo.users) return;
          rpc.get_users(null, classInfo.id).then(function(response) {
            classInfo.users = response.data;
            classInfo.user_count = utils.keys(classInfo.users).length;
          });
        });
      },
      templateUrl : 'js/email_group_chip/email_group_chip.html?tag=20180621'
    };
  });
});
