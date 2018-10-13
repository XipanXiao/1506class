angular.module('CandidatesModule', [
    'PermissionModule',
    'ServicesModule',
    'UtilsModule'
  ]).directive('candidates', function(perm, rpc, utils) {
    return {
      scope: {
        editable: '=',
        election: '='
      },
      link: function(scope) {
        scope.isVoteOwner = () => perm.isElectionOwner();
      },
      templateUrl : 'js/candidates/candidates.html?tag=201810060852'
    };
  });
  