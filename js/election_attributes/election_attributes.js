angular.module('ElectionAttributesModule', [
  'PermissionModule',
  'ServicesModule',
  'TimeModule',
  'PaperBindingsModule',
  'PaperUserInputModule',
  'UtilsModule'
]).directive('electionAttributes', function (perm, rpc, utils) {
  return {
    scope: {
      collapsed: '=',
      dirty: '=',
      district: '=',
      editable: '=',
      election: '=',
      onChange: '&',
      onCancel: '&',
      onSave: '&'
    },
    link: function (scope) {
      scope.isVoteOwner = () => perm.isElectionOwner(scope.election);

      function calcStats(election) {
        if (!scope.editable || !election) return;
        console.log('re-calculating election stats');
        var voters;

        function getVoters() {
          return rpc.get_vote_users(scope.election.id,
              scope.election.district).then((response) => {
                voters = response.data;
              });
        }

        const inDistrict = (candidate) =>
            candidate.district == election.district;
        var filtered = election.candidates.filter(inDistrict);
        scope.stats = {
          candidates: filtered.length,
        };
      }

      scope.$watch('election.district', (district) => {
        calcStats(scope.election);
      });

      scope.$watch('election', (election) => {
        if (!election) return;
        if (parseInt(election.deleted)) {
          for (var key in election) {
            delete election[key];
          }
        } else {
          calcStats(election);
        }
      });

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

      scope.toggleCollapsed = () => {
        scope.collapsed = !scope.collapsed;
      };
    },
    templateUrl: 'js/election_attributes/election_attributes.html?tag=201810221006'
  };
});
