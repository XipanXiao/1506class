angular.module('CreateElectionDialogModule', [
  'ServicesModule',
  'PaperAutoSuggestInputModule',
  'UtilsModule',
]).directive('createElectionDialog', function (rpc, utils) {
  return {
    scope: {
      onCreate: '&'
    },
    link: function (scope) {
      scope.user = {};
      scope.searchUser = rpc.searchUser;
      scope.create = function () {
        scope.onCreate({
          organizer: scope.user.id,
          name: scope.name
        });
      };
    },
    templateUrl: 'js/create_election_dialog/create_election_dialog.html?tag=20180621'
  };
});
