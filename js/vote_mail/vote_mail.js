angular.module('VoteMailModule', [
    'PermissionModule',
    'ServicesModule',
    'UtilsModule',
    'VoteMailDialogModule',
]).directive('voteMail', function (perm, rpc, utils) {
  return {
    scope: {
      election: '='
    },
    link: function (scope) {
      scope.sendMail = function() {
        var start = new Date(Date.parse(scope.election.start_time));
        if (new Date() >= start) {
          alert('投票已经开始了.');
          return;
        }
        utils.showVoteMailDialog(scope.election);
      };
    },
    templateUrl: 'js/vote_mail/vote_mail.html?tag=201810131006'
  };
});
