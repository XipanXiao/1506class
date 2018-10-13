angular.module('CandidatesModule', [
    'PermissionModule',
    'ServicesModule',
    'UtilsModule'
  ]).directive('candidates', function(perm, rpc, utils) {
    return {
      scope: {
        election: '=',
        editable: '@',
        user: '='
      },
      link: function(scope) {
          scope.isVoteOwner = () => {
            return perm.isSysAdmin() ||
                (scope.election &&
                    scope.election.organizer == scope.user.id);
          };
      },
      templateUrl : 'js/candidates/candidates.html?tag=201810060852'
    };
  });
  