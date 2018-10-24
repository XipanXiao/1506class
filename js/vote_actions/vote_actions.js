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
        scope.showActions = false;
        if (!perm.isElectionOwner(scope.election)) return;

        var end = new Date(Date.parse(scope.election.end_time));
        scope.showActions = false;
        if (new Date() >= end) {
          alert('投票已经结束了.');
          return;
        }
        utils.showVoteMailDialog(scope.election);
      };

      scope.export = () => {
        scope.showActions = false;
        if (!perm.isElectionOwner(scope.election)) return;

        var users = window.userInputCache;

        const userLabelRequest = (vote) => {
          if (users[vote.user]) {
            return () => utils.futureValue(users[vote.user]);
          }
          return () => rpc.getUserLabel(vote.user).then((response) =>
              users[vote.user] = response.data.label);
        };

        var votes = scope.election.allVotes;
        var candidates = scope.election.candidates;

        const doExport = () => {
          var data = '';
          for (let vote of votes) {
            var can = candidates[vote.candidate];
            data += '{0}\t{1}\t{2}\n'.format(users[vote.user],
              can && can.name || '到此一游', vote.ts);
          }
          scope.election.exportedDataUrl = utils.createDataUrl(data,
              scope.election.exportedDataUrl);
          return utils.truePromise();
        };
        var requests = scope.election.allVotes.map(userLabelRequest);
        requests.push(doExport);
        utils.requestOneByOne(requests);
      };
    },
    templateUrl: 'js/vote_actions/vote_actions.html?tag=201810131006'
  };
});
