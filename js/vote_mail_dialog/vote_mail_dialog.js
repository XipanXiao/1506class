angular.module('VoteMailDialogModule', [
    'CandidatesModule',
    'DistrictsModule',
    'EmailGroupChipModule',
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
        scope.select(utils.first(scope.districts));
      });

      scope.select = function(district) {
        scope.selected = district;
        if (district.users) return;
        rpc.get_district_users(district.id).then((response) =>
          district.users = response.data);
      };
    },
    templateUrl: 'js/vote_mail_dialog/vote_mail_dialog.html?tag=20180621'
  };
});
