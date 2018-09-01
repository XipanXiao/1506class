define('email_dialog/email_dialog', 
    ['email_group_chip/email_group_chip', 
    	'permission', 'services', 'utils'], function() {
  return angular.module('EmailDialogModule', [
	  'EmailGroupChipModule', 'PermissionModule', 'ServicesModule', 'UtilsModule'])
      .directive('emailDialog', function(perm, rpc, utils) {
    return {
      scope: {
    	    classes: '='
      },
      link: function(scope, element) {
    	    scope.remove = function(classInfo) {
    	    	  scope.classes.splice(scope.classes.indexOf(classInfo), 1);
    	    };
    	    function getEmails() {
    	    	  const collectEmails = (emails, classInfo) => {
    	    		return emails.concat(utils.map(classInfo.users, function(user) {
    	    		  return user.email;
    	    		}));  
    	    	  };
    	    	  return scope.classes.reduce(collectEmails, []);
    	    }
    	    scope.send = function() {
    	    	  var emails = getEmails();
    	    	  if (emails.length == 0) return;
    	    	  
    	    	  if (emails.length >= 10 && 
    	    	      !confirm('请确认您将群发邮件到{0}用户.'.format(emails.length))) return;

          return emailjs.send("bicw_notification", "bicw_group",
        {
          to: emails.join(),
          subject: scope.subject,
          body: document.querySelector('.email-body').innerHTML,
          sender: perm.user.email,
          sender_name: perm.user.name
        }).then(function(response) {
          scope.sending = false;
          var dialog = document.querySelector('#email-dialog');
          dialog.close();
        }, 
        function(error) {
          scope.sending = false;
          alert('发送邮件失败(一般因为发的人太多，用完了名额，只好麻烦您自己动手了): ' + error);
        }
      );
    	    };
      },
      templateUrl : 'js/email_dialog/email_dialog.html?tag=20180821'
    };
  });
});
