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
      });
      scope.editable = location.search.indexOf('admin=true') >= 0;
    }
  };
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['AppModule']);
});
