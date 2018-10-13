angular.module('AppModule', [
  'AppBarModule',
  'CandidatesModule',
  'CreateElectionDialogModule',
  'ElectionAttributesModule',
  'ElectionListModule',
  'PaperBindingsModule',
  'PermissionModule',
  'ServicesModule',
  'UtilsModule',
]).directive('body', function(perm, rpc, utils) {
  return {
    link: function(scope, elements) {
      rpc.get_user().then(function(user) {
        scope.user = user;
        perm.user = user;
        reload();
      });

      scope.editable = location.search.indexOf('admin=true') >= 0;

      function reload() {
        rpc.get_elections().then((response) => {
          scope.elections = response.data;
          utils.forEach(scope.elections, (election) => {
            election.label = '{0}-{1}'.format(
                election.start_time.split('-')[0], election.name);
          });
          scope.currentElection = scope.elections[0];
          scope.dirty = false;
        });  
      }

      scope.cancel = () => reload();

      scope.save = () => {
        var requests = [];
        for (let election of scope.elections) {
          for (let candidate of election.candidates) {
            if (!candidate.dirty && !candidate.deleted) continue;
            if (candidate.deleted) {
              requests.push(() => rpc.delete_candidate(candidate.id));
            } else {
              requests.push(() => rpc.update_candidate(candidate));
            }
          }

          if (election.dirty) {
            requests.push(() => rpc.update_election(election));
          } else if (election.deleted) {
            requests.push(() => rpc.delete_election(election.id));
          }
        }
        utils.requestOneByOne(requests).then(reload);
      };

      scope.markDirty = () => {
        scope.dirty = true;
      };
    }
  };
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['AppModule']);
});
