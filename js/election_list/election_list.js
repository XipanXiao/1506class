angular.module('ElectionListModule', [
    'PermissionModule',
    'ServicesModule',
    'UtilsModule'
  ]).directive('electionList', function(perm, rpc, utils) {
    return {
      scope: {
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
          utils.showElectionDialog((election) => {
            rpc.update_election(election).then((response) => {
              if (response.data.updated) {
                election = response.data.updated;
                election.label = '{0}-{1}'.format(
                  election.start_time.split('-')[0], election.name);
                scope.elections.push(election);
                scope.currentElection = election;
              } else {
                utils.showInfo(response.data.error);
              }
            });
          });
        };

        function getCandidates(election) {
          var district = !scope.editable && perm.user.district;
          return rpc.get_candidates(election.id, district).then((response) => {
            election.candidates = response.data;
            election.candidates.forEach((candidate) => {
              candidate.deleted = false;
              candidate.district = parseInt(candidate.district);
            });
            return scope.currentElection = election;
          });
        }

        function getVotes(election) {
          if (scope.editable) return utils.truePromise();
          return rpc.get_votes(election.id, perm.user.id).then((response) => {
            var votes = {};
            for (let vote of response.data) {
              votes[vote.candidate] = true;
            }
            for (let candidate of election.candidates) {
              candidate.voted = votes[candidate.id] || false;
              if (candidate.voted) election.voted++;
            }
            return true;
          });
        }

        scope.select = function(election) {
          utils.requestOneByOne([
            () => getCandidates(election),
            () => getVotes(election)
          ]);
        };
  
        scope.deleteElection = (election) => {
          rpc.delete_election(election.id).then((response) => {
            if (response.data.deleted) {
              var index = scope.elections.indexOf(election);
              scope.elections.splice(index, 1);
              if (election == scope.currentElection) {
                scope.currentElection = null;
              }
            }
          });
        };
  
        scope.isVoteOwner = () => perm.isElectionOwner();
      },
      templateUrl : 'js/election_list/election_list.html?tag=201810060852'
    };
  });
  