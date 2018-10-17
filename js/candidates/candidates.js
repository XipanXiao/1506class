angular.module('CandidatesModule', [
    'DistrictsModule',
    'PermissionModule',
    'ServicesModule',
    'PaperUserInputModule',
    'UtilsModule'
  ]).directive('candidates', function(perm, rpc, utils) {
    return {
      scope: {
        district: '=',
        editable: '=',
        election: '=',
        onChange: '&'
      },
      link: function(scope, elements) {
        scope.candidates = [];
        scope.$watch("election", reload);
        scope.voteCap = 3;
        scope.voted = 0;
        scope.isVoteOwner = () => perm.isElectionOwner();
        
        function getVotes() {
          var electionId = scope.election.id;
          return rpc.get_votes(electionId, perm.user.id).then((response) => {
            var votes = {};
            for (let vote of response.data) {
              votes[vote.candidate] = true;
            }
            for (let candidate of scope.candidates) {
              candidate.voted = votes[candidate.id] || false;
              if (candidate.voted) scope.voted++;
            }
            return true;
          });
        }
        
        function getCandidates() {
          var election = scope.election;
          var district = !scope.editable && perm.user.district;
          return rpc.get_candidates(election.id, district).then((response) => {
            scope.candidates = response.data;
            scope.election.candidates = scope.candidates;
            scope.candidates.forEach((candidate) => {
              candidate.deleted = false;
              candidate.district = parseInt(candidate.district);
            });
            return scope.selected = scope.candidates.length &&
                scope.candidates[0];
          });
        }

        function reload(election) {
          if (!election) return;
          utils.requestOneByOne([getCandidates, getVotes]);
        }

        scope.create = () => {
          scope.candidates.push(scope.selected = {
            deleted: false,
            dirty: true,
            election: scope.election.id
          });
          scope.onChange();
        };

        scope.remove = (candidate) => {
          candidate.deleted = true;
          scope.onChange();
        };

        scope.markDirty = (candidate) => {
          candidate.dirty = true;
          scope.onChange();
        };

        window.uploadImage = function(input) {
          rpc.upload_image(input.files[0]).then((url) => {
            scope.selected.profile = url;
            scope.markDirty(scope.selected);
            scope.$apply();
          });
        };

        scope.vote = (candidate) => {
          if (scope.voted >= 3) {
            alert('每人限投3票');
            return;
          }
          var data = {
            election: scope.election.id,
            user: perm.user.id,
            candidate: candidate.id
          };
          rpc.vote(data).then((response) => {
            if (response.data.updated) {
              candidate.voted = true;
              scope.voted++;
            } else {
              alert(response.data.error);
            }
          });
        };
      },
      templateUrl : 'js/candidates/candidates.html?tag=201810060852'
    };
  });
  