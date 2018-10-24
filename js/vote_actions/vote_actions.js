angular.module('VoteActionsModule', [
    'PermissionModule',
    'ServicesModule',
    'UtilsModule',
    'VoteMailDialogModule',
]).directive('voteActions', function (perm, rpc, utils) {
  return {
    scope: {
      election: '='
    },
    link: function (scope) {
      scope.sendMail = function() {
        var end = new Date(Date.parse(scope.election.end_time));
        scope.showActions = false;
        if (new Date() >= end) {
          alert('投票已经结束了.');
          return;
        }
        utils.showVoteMailDialog(scope.election);
      };
    },
    templateUrl: 'js/vote_actions/vote_actions.html?tag=201810131006'
  };
});
