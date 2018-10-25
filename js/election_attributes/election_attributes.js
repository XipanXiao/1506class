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
        var voters, votersById = {};

        function getVoters() {
          return rpc.get_vote_users(scope.election.id,
              scope.election.district).then((response) => {
                for (let voter of response.data) {
                  votersById[voter.id] = voter;
                }
                return voters = response.data;
              });
        }

        const inDistrict = (candidate) =>
            candidate.district == election.district;
        var filtered = election.district ?
            election.candidates.filter(inDistrict) :
            election.candidates;

        function doCalculate() {
          var stats = scope.stats = {
            candidates: filtered.length,
            total: voters.length,
            voter: 0,
            waiver: 0,
            votes: 0,
            email: 0,
            web: 0
          };

          var votedVoters = {};
          var waivers = {};
          // First collect all voted voters.
          for (let vote of election.allVotes) {
            if (!filtered[vote.candidate]) continue;

            stats.votes++;
            if (parseInt(vote.source)) {
              stats.email++;
            } else {
              stats.web++;
            }
            if (!votedVoters[vote.user]) {
              votedVoters[vote.user] = true;
              stats.voter++;
            }            
          }
          // Then collect all waived voters.
          for (let vote of election.allVotes) {
            if (vote.candidate ||
                votedVoters[vote.user] ||
                waivers[vote.user] ||
                !votersById[vote.user]) {
              continue;
            }
            waivers[vote.user] = true;
            stats.waiver++;
          }

          stats.unresponded = stats.total - (stats.voter + stats.waiver);
          stats.ratio = (stats.voter * 100.0 / stats.total).toFixed(2) + '%';
          stats.effectiveRatio = (stats.voter * 100.0 / (stats.total - stats.waiver)).toFixed(2) + '%';
          return utils.truePromise();
        }

        utils.requestOneByOne([getVoters, doCalculate]);
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
