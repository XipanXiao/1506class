angular.module('CreateElectionDialogModule', [
    'ServicesModule',
    'UserInputModule',
    'UtilsModule',
  ]).directive('createElectionDialog', function(rpc, utils) {
  return {
    scope: {
        onCreate: '&'
    },
    link: function(scope) {
      scope.user = {};
      scope.create = function() {
        scope.onCreate({
          organizer: scope.user.id,
          name: document.querySelector('#election-name-input').value
        });
      };
    },
    templateUrl : 'js/create_election_dialog/create_election_dialog.html?tag=20180621'
  };
});
