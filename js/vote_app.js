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
        return rpc.get_elections().then((response) => {
          scope.elections = response.data;
          utils.forEach(scope.elections, (election) => {
            election.label = '{0}-{1}'.format(
                election.start_time.split('-')[0], election.name);
          });
          scope.currentElection =
              scope.elections[scope.elections.length - 1];
          scope.dirty = false;
          return true;
        });  
      }

      scope.cancel = () => reload();

      const checkResponse = (response) => {
        return parseInt(response.data.updated) ||
            parseInt(response.data.deleted);
      };

      scope.save = () => {
        var requests = [];
        for (let election of scope.elections) {
          for (let candidate of election.candidates) {
            if (!candidate.dirty && !candidate.deleted) continue;
            if (candidate.deleted) {
              requests.push(() =>
                  rpc.delete_candidate(candidate.id).then(checkResponse));
            } else {
              requests.push(() =>
                  rpc.update_candidate(candidate).then(checkResponse));
            }
          }

          if (election.dirty) {
            requests.push(() =>
                rpc.update_election(election).then(checkResponse));
          } else if (election.deleted) {
            requests.push(() =>
                rpc.delete_election(election.id).then(checkResponse));
          }
        }
        requests.push(reload);
        utils.requestOneByOne(requests);
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
