angular.module('CandidatesModule', [
    'PermissionModule',
    'ServicesModule',
    'PaperUserInputModule',
    'UtilsModule'
  ]).directive('candidates', function(perm, rpc, utils) {
    return {
      scope: {
        editable: '=',
        election: '=',
        onChange: '&'
      },
      link: function(scope, elements) {
        scope.candidates = [];
        scope.$watch("election", reload);
        scope.isVoteOwner = () => perm.isElectionOwner();

        function reload(election) {
          if (!election) return;

          var district = !scope.editable && perm.user.district;
          rpc.get_candidates(election.id, district).then((response) => {
            scope.candidates = response.data;
            scope.election.candidates = scope.candidates;
            scope.candidates.forEach((candidate) => {
              candidate.deleted = false;
            });
            scope.selected = scope.candidates.length &&
                scope.candidates[0];
          });
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
          var index = scope.candidates.indexOf(candidate);
          scope.candidates.splice(index, 1);
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
      },
      templateUrl : 'js/candidates/candidates.html?tag=201810060852'
    };
  });
  