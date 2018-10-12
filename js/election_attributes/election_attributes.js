angular.module('ElectionAttributesModule', [
  'ServicesModule',
  'UtilsModule'
]).directive('electionAttributes', function(rpc, utils) {
  return {
    scope: {
      editable: '@',
      election: '='
    },
    link: function(scope) {
      var savedElection;
      scope.cancel = () => {
        if (!scope.dirty) return;
  
        scope.dirty = false;
        utils.mix_in(scope.election, savedElection);
      };
  
      scope.save = () => {
        var data = {
          id: scope.election.id,
          name: scope.election.name,
          description: scope.election.description
        };
        rpc.update_election(data).then((response) => {
          scope.dirty = parseInt(response.data.updated) == 0;
        });
      };
  
      scope.markDirty = (dirty) => { 
        if (scope.dirty == dirty) return;
  
        if (dirty) {
          savedElection = angular.copy(scope.election);
        }
  
        scope.dirty = dirty;
      };  
    },
    templateUrl : 'js/election_attributes/election_attributes.html?tag=201810060852'
  };
});
