angular.module('VoteMailDialogModule', [
    'CandidatesModule',
    'DistrictsModule',
    'ServicesModule',
    'UtilsModule',
]).directive('voteMailDialog', function (rpc, utils) {
  return {
    scope: {
      election: '='
    },
    link: function (scope) {
      rpc.get_districts().then((response) => {
        scope.districts = response.data;
        scope.selected = utils.first(scope.districts);
      });

      scope.select = function(district) {
        scope.selected = district;
      };
    },
    templateUrl: 'js/vote_mail_dialog/vote_mail_dialog.html?tag=20180621'
  };
});
