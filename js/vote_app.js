angular.module('AppModule', [
  'AppBarModule',
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
        var election = {
          name: '点击修改名字...',
          description: '点击输入描述...'
        };
        rpc.update_election(election).then((response) => {
          if (response.data.updated) {
            reload();
          } else {
            utils.showInfo(response.data.error);
          }
        });
      };

      scope.deleteElection = (election) => {
        rpc.delete_election(election.id).then((response) => {
          if (response.data.deleted) {
            var index = scope.elections.indexOf(election);
            scope.elections.splice(index, 1);
          }
        });
      };

      reload();
    }
  };
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['AppModule']);
});
