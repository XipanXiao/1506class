angular.module('VoteMailDialogModule', [
    'CandidatesModule',
    'DistrictsModule',
    'EmailGroupChipModule',
    'PermissionModule',
    'ProgressBarModule',
    'ServicesModule',
    'UtilsModule',
]).directive('voteMailDialog', function (perm, rpc, utils) {
  return {
    scope: {
      election: '='
    },
    link: function (scope) {
      scope.vote_url = utils.getBaseUrl() + 'vote.html';

      scope.$watch('election', (election) => {
        if (!election || scope.districts) return;

        rpc.get_districts().then((response) => {
          scope.districts = response.data;
          scope.select(utils.first(scope.districts));
        });  
      });

      scope.select = function(district) {
        scope.selected = district;
        if (district.users) return;
        rpc.get_vote_users(scope.election.id, district.id).then((response) =>
          district.users = response.data);
      };

      scope.send = function() {
        scope.sent = 0;
        scope.error = 0;
        scope.messages = [];
        var users = scope.selected.users;

        var testUsers = ['xxp9@', 'caoxiaoming0@',
            'carollin1988@', 'nonoxu@', 'decentsword@'];
        const inTest = (user) =>
          testUsers.some((email) => user.email.indexOf(email) >= 0);
        users = users.filter(inTest);

        scope.total = users.length;

        var mailContent = document.querySelector('#vote-mail-body');

        function sendEmail(user) {
          return () => {
            const setVoteLink = (a) => {
              a.href += '&election={0}&user={1}&token={2}'.format(
                  scope.election.id, user.id, user.token);
            };
      
            mailContent.querySelectorAll('.vote-link').forEach(setVoteLink);

            return emailjs.send("bicw_notification", "bicw_group", {
              subject: scope.election.name,
              to: user.email,
              body: mailContent.innerHTML,
              sender: perm.user.email,
              sender_name: perm.user.name
            }).then(function(response) {
              scope.sent++;
              return true;
            }, function(error) {
              scope.error++;
              scope.messages.push(error);
              return true;
            });
          }
        }
        utils.requestOneByOne(users.map(sendEmail));
      };
  },
    templateUrl: 'js/vote_mail_dialog/vote_mail_dialog.html?tag=20181022'
  };
});
