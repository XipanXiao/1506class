angular.module('ElectionAttributesModule', [
  'PermissionModule',
  'ServicesModule',
  'TimeModule',
  'UserInputModule',
  'UtilsModule'
]).directive('electionAttributes', function(perm, rpc, utils) {
  return {
    scope: {
      editable: '=',
      election: '=',
    },
    link: function(scope) {
      var savedElection;
      scope.cancel = () => {
        if (!scope.dirty) return;
  
        scope.dirty = false;
        utils.mix_in(scope.election, savedElection);
      };

      scope.isVoteOwner = () => perm.isElectionOwner();
  
      scope.save = () => {
        var data = {
          id: scope.election.id,
          name: scope.election.name,
          description: scope.election.description,
          start_time: scope.election.start_time,
          end_time: scope.election.end_time,
          organizer: scope.election.organizer
        };
        rpc.update_election(data).then((response) => {
          scope.dirty = parseInt(response.data.updated) == 0;
        });
      };
  
      const validate = () => {
        var start = new Date(Date.parse(scope.election.start_time));
        var end = new Date(Date.parse(scope.election.end_time));
        return start <= end;
      };

      scope.markDirty = () => { 
        if (scope.dirty) return;
  
        scope.message = '';
        if (validate()) {
          savedElection = angular.copy(scope.election);
          scope.dirty = true;
        } else {
          scope.message = '开始时间必须早于结束时间';
        }
      };

    },
    templateUrl : 'js/election_attributes/election_attributes.html?tag=201810131006'
  };
});
