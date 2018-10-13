angular.module('ElectionAttributesModule', [
  'PermissionModule',
  'ServicesModule',
  'TimeModule',
  'UserInputModule',
  'UtilsModule'
]).directive('electionAttributes', function(perm, rpc, utils) {
  return {
    scope: {
      dirty: '=',
      editable: '=',
      election: '=',
      onChange: '&',
      onCancel: '&',
      onSave: '&'
    },
    link: function(scope) {
      scope.isVoteOwner = () => perm.isElectionOwner();
  
      scope.validate = () => {
        scope.message = '';
        var start = new Date(Date.parse(scope.election.start_time));
        var end = new Date(Date.parse(scope.election.end_time));
        if (start > end) {
          scope.message = '开始时间必须早于结束时间';
        } else {
          scope.markDirty();
        }
      };

      scope.markDirty = () => {
        scope.election.dirty = true;
        scope.onChange();
      };
    },
    templateUrl : 'js/election_attributes/election_attributes.html?tag=201810131006'
  };
});
