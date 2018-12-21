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
      editable: '=',
      election: '=',
      onChange: '&',
      onCancel: '&',
      onSave: '&'
    },
    link: function (scope) {
      scope.isVoteOwner = () => perm.isElectionOwner(scope.election);

      var votersById;
      var allDistrcits;
      var districts;

      const getDistricts = () => {
        if (districts) return utils.futureValue(districts);
        return rpc.get_districts().then((response) => {
          return districts = response.data;
        });
      };

      function calcStats(election) {
        if (!scope.editable || !election) return;

        const inDistrict = (user) => {
          if (election.district) {
            return user.district == election.district;
          } else {
            return allDistrcits[user.district];
          }
        };
  
        const filterVoters = () =>
            utils.toList(utils.where(votersById, inDistrict));

        allDistrcits = {};
        utils.forEach(election.candidates, function(candidate) {
          allDistrcits[candidate.district] = true;
        });

        var voters;

        function getVoters() {
          if (votersById) {
            return utils.futureValue(voters = filterVoters());
          }
          votersById = {};
          scope.election.votersById = votersById;
          const getDistrictVoters = (district) => {
            return rpc.get_vote_users(scope.election.id, district)
                .then((response) => {
              utils.forEach(response.data, function(voter) {
                votersById[voter.id] = voter;
                voter.district = parseInt(voter.district);
              });
            });
          };
          var promises = utils.keys(allDistrcits).map(getDistrictVoters);
          return Promise.all(promises).then(() => voters = filterVoters());
        }

        function doCalculate() {
          var districtIds = election.district ?
              [election.district] : utils.keys(allDistrcits);
          scope.districtNames = districtIds.map(
              (districtId) => districts[districtId].name).join(',');

          var stats = scope.stats = {
            total: voters.length,
            candidates: 0,
            voter: 0,
            waiver: 0,
            votes: 0,
            email: 0,
            web: 0
          };
          var candidatesMap = {};
          utils.forEach(election.candidates, function(candidate) {
            if (inDistrict(candidate)) {
              candidatesMap[candidate.id] = candidate;
              stats.candidates++;
            }
          });

          var votedVoters = {};
          var waivers = {};
          // First collect all voted voters.
          utils.forEach(election.allVotes, function(vote) {
            var candidate = candidatesMap[vote.candidate];
            if (!candidate) continue;
            var voter = votersById[vote.user];
            if (!voter ||
              voter.district != candidate.district && !election.global) {
              continue;
            }

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
          });
          // Then collect all waived voters.
          utils.forEach(election.allVotes, function(vote) {
            if (vote.candidate ||
                votedVoters[vote.user] ||
                waivers[vote.user]) {
              return;
            }
            var user = votersById[vote.user];
            if (!user || !inDistrict(user)) return;

            waivers[vote.user] = true;
            stats.waiver++;
          });

          stats.unresponded = stats.total - (stats.voter + stats.waiver);
          stats.ratio = (stats.voter * 100.0 / stats.total).toFixed(2) + '%';
          stats.effectiveRatio = ((stats.voter + stats.waiver) * 100.0 / stats.total).toFixed(2) + '%';
          return utils.truePromise();
        }

        utils.requestOneByOne([getDistricts, getVoters, doCalculate]);
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
    templateUrl: 'js/election_attributes/election_attributes.html?tag=201812201006'
  };
});
