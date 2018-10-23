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
        if (perm.user.classInfo.department_id == 8 ||
            perm.user.classInfo.department_id == 9) {
          utils.login();
        } else {
          reload();
        }
      });

      scope.editable = location.search.indexOf('admin=true') >= 0;

      function reload() {
        return rpc.get_elections().then((response) => {
          scope.elections = response.data;
          utils.forEach(scope.elections, (election) => {
            election.max_vote = parseInt(election.max_vote);
            election.global = !!parseInt(election.global);
            election.label = '{0}-{1}'.format(
                election.start_time.split('-')[0], election.name);
          });
          scope.dirty = false;
          return true;
        });
      }

      scope.cancel = () => reload();

      const checkResponse = (response) => {
        return response.data.updated && response.data.updated.id ||
            parseInt(response.data.updated) ||
            parseInt(response.data.deleted);
      };

      scope.save = () => {
        var requests = [];
        for (let election of scope.elections) {
          for (let candidate of election.candidates) {
            if (!candidate.dirty && !candidate.deleted) continue;
            if (candidate.deleted) {
              if (candidate.id) {
                requests.push(() =>
                    rpc.delete_candidate(candidate.id).then(checkResponse));
              }
            } else {
              requests.push(() =>
                  rpc.update_candidate(candidate).then(checkResponse));
            }
          }

          if (election.dirty) {
            election.start_time = election.start_time.
                replace(/ [\d]{2}:[\d]{2}:[\d]{2}/, ' 00:00:00');
            election.end_time = election.end_time.
                replace(/ [\d]{2}:[\d]{2}:[\d]{2}/, ' 23:59:59');
            election.global = election.global ? 1 : 0;
            requests.push(() =>
                rpc.update_election(election).then(checkResponse));
          }
        }
        requests.push(reload);
        utils.requestOneByOne(requests);
      };

      scope.markDirty = () => {
        scope.dirty = true;
      };

      if (scope.editable) {
        emailjs.init("user_ZAqyLkjaj5MHdbn3alvEx");
        window.onbeforeunload = () => scope.dirty ? '' : null;
      }
      if (window.outerWidth < 250 + 700 + 392) {
        scope.electionsCollapsed = true;
        scope.attributesCollapsed = true;
      }
    }
  };
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['AppModule']);
});
