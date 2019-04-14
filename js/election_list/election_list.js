angular.module('ElectionListModule', [
    'PermissionModule',
    'ServicesModule',
    'UtilsModule'
  ]).directive('electionList', function(perm, rpc, utils) {
    return {
      scope: {
        collapsed: '=',
        currentElection: '=',
        editable: '=',
        elections: '=',
        onChange: '&'
      },
      link: function(scope) {
        scope.isSysAdmin = () => perm.isSysAdmin();

        scope.$watch('elections', selectLastElection);

        function selectLastElection(elections) {
          if (!elections || !elections.length) return;
          var election = elections[elections.length - 1];
          scope.select(election);
        }

        selectLastElection(scope.elections);

        scope.createElection = () => {
          if (!perm.isSysAdmin()) return;

          utils.showElectionDialog((election) => {
            rpc.update_election(election).then((response) => {
              if (response.data.updated) {
                election = response.data.updated;
                election.label = '{0}-{1}'.format(
                  election.start_time.split('-')[0], election.name);
                election.candidates = [];
                election.voted = 0;
                scope.elections.push(election);
                scope.currentElection = election;
              } else {
                utils.showInfo(response.data.error);
              }
            });
          });
        };

        function getCandidates(election) {
          var district = !scope.editable &&
              !election.global &&
              perm.user.district;
          return rpc.get_candidates(election.id, district).then((response) => {
            election.candidates = response.data;
            election.candidates.forEach((candidate) => {
              candidate.deleted = false;
              candidate.district = parseInt(candidate.district);
              window.userInputCache = window.userInputCache || {};
              window.userInputCache[candidate.user] = candidate.name;
            });
            return true;
          });
        }

        // Vote an empty candidate to record 'I am here'.
        const visited = (election) =>
          rpc.vote({election: election.id, user: perm.user.id});

        function getVotes(election) {
          election.voted = 0;
          var userId = !scope.editable && perm.user.id;
          return rpc.get_votes(election.id, userId).then((response) => {
            var votes = {}, myvotes = {};
            if (!response.data.length && !scope.editable) {
              visited(election);
            }
            utils.forEach(response.data, function(vote) {
              if (!vote.candidate) return;
              votes[vote.candidate] = (votes[vote.candidate] || 0) + 1;
              if (vote.user == perm.user.id) {
                myvotes[vote.candidate] = vote.id;
              }
            });
            utils.forEach(election.candidates, function(candidate) {
              candidate.voted = myvotes[candidate.id] || 0;
              candidate.votes = votes[candidate.id] || 0;
              if (candidate.voted) election.voted++;
            });
            election.allVotes = response.data;
            return scope.currentElection = election;
          });
        }

        scope.select = function(election) {
          if (scope.editable && !perm.isElectionOwner(election)) {
            return utils.login();
          }
          utils.requestOneByOne([
            () => getCandidates(election),
            () => getVotes(election)
          ]);
        };
  
        scope.deleteElection = (election) => {
          if (!confirm('请确认您要删除"{0}"的全部数据'
              .format(election.label))) {
            return;
          }
          rpc.delete_election(election.id).then((response) => {
            if (response.data.deleted) {
              var index = scope.elections.indexOf(election);
              scope.elections.splice(index, 1);
              election.deleted = 1;
              election.candidates.length = 0;
              if (election == scope.currentElection) {
                scope.currentElection = null;
              }
            }
          });
        };
  
        scope.isVoteOwner = () =>
            perm.isElectionOwner(scope.currentElection);

        scope.toggleCollapsed = () => {
          scope.collapsed = !scope.collapsed;
        };
      },
      templateUrl : 'js/election_list/election_list.html?tag=201810230852'
    };
  });
  
