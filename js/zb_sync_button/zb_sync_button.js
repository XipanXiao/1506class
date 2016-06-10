define('zb_sync_button/zb_sync_button',
    ['progress_bar/progress_bar', 'services', 'utils', 'zb_api',
     'zb_services'], function() {
  return angular.module('ZBSyncButtonModule', ['ProgressBarModule',
      'ServicesModule', 'UtilsModule', 'ZBAPIModule', 'ZBServicesModule'])
      .directive('zbSyncButton', function($q, rpc, utils, zbapi, zbrpc) {
      return {
        scope: {
          classId: '=',
          scheduleGroup: '=',
          type: '@',
          users: '=',
        },
        link: function(scope) {
          scope.zbIconUrl = '{0}/../favicon.ico'.format(zbrpc.serviceUrl);
          scope.$watch('classId', function() {
            if (!scope.classId) return;
            // http://db.zhibeifw.com:8888/zb/pre/report?pre_classID=6377&half_term=4
            // http://db.zhibeifw.com:8888/favicon.ico
            rpc.get_classes(scope.classId).then(function(response) {
              scope.classInfo = response.data[scope.classId];
              scope.zbUrl = zbrpc.get_report_result_url(scope.classInfo.zb_id,
                  scope.scheduleGroup.term * 2);
            });
          });
          scope.sync = function() {
            if (scope.inprogress) return;

            switch (scope.type) {
            case 'schedule_task':
              return this.report_schedule_task();
            default:
              break;
            }
          };
          
          scope.getUserRecords = function(user) {
            var index = 0;
            var group = scope.scheduleGroup;
            var audio = [];
            var book = [];
            var half = 11;// 11 + 12 = 23 weeks.

            for (var id in group.schedules) {
              var schedule = group.schedules[id];
              if (!parseInt(schedule.course_id)) continue;
              var record = user.records[schedule.course_id];
              audio[index] = (record && record.video) ? 1 : 0;
              book[index] = (record && record.text) ? 1 : 0;
              index++;
            }
            
            return [
              {audio: audio.slice(0, half), book: book.slice(0, half)},
              {audio: audio.slice(half), book: book.slice(half)}
            ];
          };

          // Determine which half terms to report, based on current time.
          scope.getHalfTerms = function() {
            var now = (new Date()).getTime();
            var startDate = utils.toDateTime(scope.scheduleGroup.start_time);
            var midTerm = new Date(startDate.getTime());
            midTerm.setDate(startDate.getDate() + 7 * 12);

            // Before middle of the current term, nothing to report yet.
            if (now < midTerm.getTime()) return [];

            var endTerm = new Date(startDate.getTime());
            endTerm.setDate(startDate.getDate() + 7 * 25);
            
            // Between mid-term and the end of the term, report the first half.
            if (midTerm.getTime() <= now && now < endTerm.getTime()) {
              return [0];
            }
            
            // Report both the first and the second half terms.
            return [0, 1];
          };
          scope.report_schedule_task = function() {
            scope.inprogress = true;
            scope.ensure_authenticated().then(function() {
              var half_terms = scope.getHalfTerms();
              var half_term_base = scope.scheduleGroup.term * 2;

              var promises = [];
              var users = scope.users;
              scope.totalTasks = half_terms.length * utils.keys(users).length;
              scope.doneTasks = 0;
              scope.inprogress = true;
              half_terms.forEach(function(half_term) {
                for (var id in users) {
                  var user = users[id];
                  user.done = [];
                  var records = scope.getUserRecords(user);
                  var reportPromise = zbrpc.report_schedule_task(
                      parseInt(scope.classInfo.zb_id), parseInt(user.zb_id),
                      half_term_base + half_term, records[half_term].book,
                      records[half_term].audio).then(function(response) {
                        scope.doneTasks++;
                        return response.data.returnValue == 'success';
                      });
                  promises.push(reportPromise);
                }
              });
              $q.all(promises).then(function() {
                scope.inprogress = false;
              });
            });
          };
          scope.ensure_authenticated = function() {
            return zbrpc.is_authenticated().then(function(authenticated) {
              return authenticated || scope.showLoginDialog();
            });
          };
          scope.showLoginDialog = function() {
            scope.inprogress = false;
            scope.username = 'zhibeihw1';
            document.querySelector('#zb-login').open();
            scope.deferredLogin = $q.defer();
            return scope.deferredLogin.promise;
          };
          scope.login = function() {
            var username = document.querySelector('#zb-username').value;
            var password = document.querySelector('#zb-password').value;
            var editPassword = document.querySelector('#zb-editpassword').value;
            scope.inprogress = true;
            zbrpc.login(username, password).then(function(response) {
              if (zbrpc.is_showing_login_form(response.data)) {
                scope.inprogress = false;
                alert('登录失败');
              } else {
                zbrpc.edit(editPassword).then(function(approved) {
                  scope.inprogress = false;
                  approved ? 
                      scope.deferredLogin.resolve() :
                      scope.deferredLogin.reject();
                });
              }
            });
          };
        },
        templateUrl: 'js/zb_sync_button/zb_sync_button.html'
      };
    });
});
