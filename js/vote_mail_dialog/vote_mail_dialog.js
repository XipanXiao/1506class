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
        const inDistrict = (candidate) =>
            candidate.district == district.id;
        scope.filtered = scope.election.
            candidates.filter(inDistrict).length;
      if (district.users) return;
        rpc.get_vote_users(scope.election.id, district.id).then((response) =>
          district.users = response.data);
      };

      function replaceUrlParam(url, data) {
        for (var key in data) {
          var pattern = new RegExp('&{0}=([^&]*)'.format(key));
          url = url.replace(pattern, '&{0}={1}'.format(key, data[key]));
        }
        return url;
      }

      scope.send = function() {
        scope.sent = 0;
        scope.error = 0;
        scope.messages = [];
        scope.sending = true;
        var users = scope.selected.users;

        testUsers = ['xxp9'];
        const inTest = (user) =>
          testUsers.some((email) => user.email.indexOf(email) >= 0);
        users = users.filter(inTest);

        scope.total = users.length;

        var mailContent = document.querySelector('#vote-mail-body');

        function sendEmail(user) {
          return () => {
            const setVoteLink = (a) => {
              a.href = replaceUrlParam(a.href,
                  {user: user.id, token: user.token});
            };
      
            mailContent.querySelectorAll('.vote-link').forEach(setVoteLink);

            return emailjs.send("bicw_notification", "bicw_group", {
              subject: scope.election.name,
              to: user.email,
              body: mailContent.innerHTML,
              sender: perm.user.email,
              sender_name: 'BSA-US'
            }).then(function(response) {
              scope.sent++;
              scope.$apply();
              return true;
            }, function(error) {
              scope.error++;
              scope.messages.push('发送邮件到{0}({1})失败: {2}'.
                  format(user.name, user.email, '' + error));
              scope.$apply();
              return true;
            });
          }
        }
        utils.requestOneByOne(users.map(sendEmail)).then(() => {
          scope.sending = false;
          scope.$apply();
        });
      };
  },
    templateUrl: 'js/vote_mail_dialog/vote_mail_dialog.html?tag=201810222257'
  };
});
