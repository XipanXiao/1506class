angular.module('AppModule', [
  'AppBarModule',
  'CreateElectionDialogModule',
  'EditableLabelModule',
  'PermissionModule',
  'ServicesModule',
  'UtilsModule',
]).directive('body', function(perm, rpc, utils) {
  return {
    link: function(scope) {
      rpc.get_user().then(function(user) {
        scope.user = user;
        perm.user = user;
      });

      function reload() {
        rpc.get_elections().then((response) => {
          scope.elections = response.data;
          utils.forEach(scope.elections, (election) => {
            election.label = '{0}-{1}'.format(
                election.start_time.split('-')[0], election.name);
          });
          scope.currentElection = scope.elections[0];
        });  
      }

      scope.editable = location.search.indexOf('admin=true') >= 0;
      scope.isSysAdmin = () => perm.isSysAdmin();

      scope.createElection = () => {
        utils.showElectionDialog((election) => {
          rpc.update_election(election).then((response) => {
            if (response.data.updated) {
              reload();
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

      scope.isVoteOwner = () => {
        return perm.isSysAdmin() ||
            (scope.currentElection &&
                scope.createElection.organizer == scope.user.id);
      };

      reload();
    }
  };
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['AppModule']);
});
