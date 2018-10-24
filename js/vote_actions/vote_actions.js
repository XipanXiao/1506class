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

        const getDistricts = () =>
            rpc.get_districts().then((response) => districts = response.data);

        var districts;
        var votes = scope.election.allVotes;
        var candidates = utils.toMap(scope.election.candidates);
        var sources = ['网站', '邮件'];

        const doExport = () => {
          var data = '时间\t投票人\t候选人\t地区\t来源\n';
          for (let vote of votes) {
            var can = candidates[vote.candidate];
            var district = can && districts[can.district].name || '';
            data += '{0}\t{1}\t{2}\t{3}\t{4}\n'.format(vote.ts, users[vote.user],
              can && can.name || '到此一游', district, sources[vote.source]);
          }
          scope.election.exportedDataUrl = utils.createDataUrl(data,
              scope.election.exportedDataUrl);
          return utils.truePromise();
        };
        var requests = scope.election.allVotes.map(userLabelRequest);
        requests.push(getDistricts);
        requests.push(doExport);
        utils.requestOneByOne(requests);
      };
    },
    templateUrl: 'js/vote_actions/vote_actions.html?tag=201810131006'
  };
});
