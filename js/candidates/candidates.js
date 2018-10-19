angular.module('CandidatesModule', [
    'DistrictsModule',
    'FileInputModule',
    'PermissionModule',
    'ServicesModule',
    'PaperUserInputModule',
    'UtilsModule',
    'VoteMailModule',
  ]).directive('candidates', function(perm, rpc, utils) {
    return {
      scope: {
        district: '=',
        editable: '=',
        election: '=',
        inEmail: '@',
        onChange: '&'
      },
      link: function(scope, elements) {
        scope.isVoteOwner = () => perm.isElectionOwner();

        scope.$watch('election', (election) => {
          if (election && parseInt(election.deleted)) {
            election.name = '';
            election.candidates = [];
          }
        });

        scope.create = () => {
          scope.election.candidates.push({
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

        scope.uploadImage = (event, candidate) => {
          rpc.upload_image(event.target.files[0]).then((url) => {
            candidate.profile = url;
            scope.markDirty(candidate);
            scope.$apply();
          });
        };

        scope.vote = (candidate) => {
          if (scope.election.voted >= scope.election.max_vote) {
            alert('每人限投{0}}票'.format(scope.election.max_vote));
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
              scope.election.voted++;
            } else {
              alert(response.data.error);
            }
          });
        };
      },
      templateUrl : 'js/candidates/candidates.html?tag=201810060852'
    };
  });
  