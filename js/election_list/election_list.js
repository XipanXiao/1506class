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
  
        scope.createElection = () => {
          utils.showElectionDialog((election) => {
            rpc.update_election(election).then((response) => {
              if (response.data.updated) {
                election.id = response.data.updated;
                scope.elections.push(election);
              } else {
                utils.showInfo(response.data.error);
              }
            });
          });
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
  