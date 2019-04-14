angular.module('CandidatesModule', [
    'DistrictsModule',
    'FileInputModule',
    'PermissionModule',
    'ServicesModule',
    'PaperAutoSuggestInputModule',
    'UtilsModule',
    'VoteActionsModule',
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
        scope.self = scope;
        scope.isVoteOwner = () => perm.isElectionOwner(scope.election);
        scope.filtered = scope.election &&
            scope.election.candidates.length || 0;
        scope.searchUser = rpc.searchUser;

        scope.$watch('election', (election) => {
          if (!election) return;
          if (parseInt(election.deleted)) {
            election.name = '';
            election.candidates = [];
            scope.filtered = 0;
          } else {
            scope.filtered = election.candidates.length;
          }
        });

        scope.create = () => {
          scope.election.candidates.push({
            deleted: false,
            dirty: true,
            election: scope.election.id
          });
          elements[0].querySelector('tr:last-child').scrollIntoView();
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
            alert('每人限投{0}票'.format(scope.election.max_vote));
            return;
          }
          var data = {
            election: scope.election.id,
            user: perm.user.id,
            candidate: candidate.id
          };
          rpc.vote(data).then((response) => {
            var voteId = parseInt(response.data.updated);
            if (voteId) {
              candidate.voted = voteId;
              scope.election.voted++;
            } else {
              alert(response.data.error);
            }
          });
        };

        scope.$watch('district', (district) => {
          if (district) {
            const inDistrict = (candidate) =>
                candidate.district == scope.district;
            scope.filtered = scope.election.
                candidates.filter(inDistrict).length;
          } else {
            scope.filtered = scope.election &&
                scope.election.candidates.length || 0;
          }
        });

        scope.districtFilterChanged = (district) => {
          scope.election.district = district;
        };

        scope.toggleDistrictFilter = () => {
          if (!scope.filterByDistrict) {
            delete scope.district;
            delete scope.election.district;
          }
        };
        
        scope.unvote = function(candidate) {
          rpc.delete_vote(candidate.voted).then((response) => {
            if (response.data.deleted) {
              candidate.voted = 0;
              scope.election.voted--;
            } else {
              alert(response.data.error);
            }
          });
        };
      },
      templateUrl : 'js/candidates/candidates.html?tag=201811031942'
    };
  });

