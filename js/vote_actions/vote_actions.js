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

        var now = utils.toEST(new Date());
        var start = new Date(Date.parse(scope.election.start_time));
        var end = new Date(Date.parse(scope.election.end_time));
        if (now < start || end < now) {
          alert('还没有开始，或已经结束.');
          return;
        }
        utils.showVoteMailDialog(scope.election);
      };

      scope.export = () => {
        scope.showActions = false;
        if (!perm.isElectionOwner(scope.election)) return;

        const getDistricts = () =>
            rpc.get_districts().then((response) => districts = response.data);
        const getClasses = () =>
            rpc.get_classes().then((response) => classes = response.data);

        var districts, classes;
        var votes = scope.election.allVotes;
        var candidates = utils.toMap(scope.election.candidates);
        var sources = ['网站', '邮件'];

        const doExport = () => {
          var data = '时间\t投票人\t候选人\t地区\t来源\n';
          var users = scope.election.votersById;
          var votedUser = {};
          var waived = {};
          for (let vote of votes) {
            if (!vote.candidate) continue;
            var user = users[vote.user];
            if (!user) continue;
            votedUser[vote.user] = true;
            var can = candidates[vote.candidate];
            var district = districts[can.district].name;
            data += '{0}\t{1}\t{2}\t{3}\t{4}\n'.format(vote.ts, user.name,
              can.name, district, sources[vote.source]);
          }
          for (let vote of votes) {
            if (vote.candidate) continue;
            var user = users[vote.user];
            if (!user || votedUser[user.id]) continue;
            waived[user.id] = true;
            var district = districts[user.district].name;
            data += '{0}\t{1}\t{2}\t{3}\t{4}\n'.format(vote.ts, user.name,
              '弃权', district, sources[vote.source]);
          }

          scope.election.exportedDataUrl = utils.createDataUrl(data,
              scope.election.exportedDataUrl);
          
          data = '姓名\t邮件\t地区\t班级\n';
          for (var id in users) {
            if (votedUser[id] || waived[id]) continue;
            var user = users[id];
            data += '{0}\t{1}\t{2}\t{3}\n'.format(user.name, user.email,
                districts[user.district].name, classes[user.classId].name);
          }
          scope.election.unVotedUserDataUrl = utils.createDataUrl(data,
            scope.election.unVotedUserDataUrl);
        return utils.truePromise();
        };
        utils.requestOneByOne([getDistricts, getClasses, doExport]);
      };
    },
    templateUrl: 'js/vote_actions/vote_actions.html?tag=201810131006'
  };
});
