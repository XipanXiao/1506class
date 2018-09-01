define('email_group_chip/email_group_chip', ['services', 'utils'], function() {
  return angular.module('EmailGroupChipModule', ['ServicesModule', 'UtilsModule'])
      .directive('emailGroupChip', function(rpc, utils) {
    return {
      scope: {
    	    classInfo: '=',
    	    remove: '&'
      },
      link: function(scope, element) {
    	    scope.toggleExpand = function() {
    	    	  scope.expanded = !scope.expanded;
    	    };
    	    scope.removeUser = function(user) {
    	    	  delete scope.classInfo.users[user.id];
    	    };
      },
      templateUrl : 'js/email_group_chip/email_group_chip.html?tag=20180621'
    };
  });
});
