define('zb_sync/zb_sync',
    ['progress_bar/progress_bar', 'services', 'utils', 'zb_api',
     'zb_services'], function() {
  return angular.module('ZBSyncModule', ['ProgressBarModule',
      'ServicesModule', 'UtilsModule', 'ZBAPIModule', 'ZBServicesModule'])
      .directive('zbSync', function(rpc, utils, zbapi, zbrpc) {
      return {
        scope: {
          classId: '=',
        },
        link: function(scope) {
          scope.username = 'zhibeihw1';
          scope.serviceUrl = zbrpc.serviceUrl;
          scope.study_style = 2;

          scope.inprogress = 1;
          scope.success = 2;
          scope.failed = 3;
          
          scope.login = function() {
            scope.error = null;
            scope.loginStatus = scope.inprogress;
            zbrpc.login(scope.username, scope.password)
                .then(function(response) {
              var hasPassword =
                (response.data || '').indexOf('<input type="password"') > 0;
              scope.loginStatus = hasPassword ? scope.failed : scope.success;
              if ((response.data || '').indexOf('用户名或密码错误!') >= 0) {
                scope.error = '用户名或密码错误!';
              }
            });
          };
          
          // Index in the classes list at the same location and in the same
          // department, within the same school year.
          // e.g. 
          //   1506加行美国周二班 localId: 1
          //   1506加行美国周四班 localId: 2
          //   1506加行美国周六班 localId: 3
          var getLocalId = function() {
            return rpc.get_classes().then(function(response) {
              scope.classInfo = response.data[scope.classId];
              var classes = utils.where(response.data, function(classInfo) {
                return classInfo.start_year == scope.classInfo.start_year &&
                    classInfo.department_id == scope.classInfo.department_id;
              });
              var localId = 0;
              for (var id in classes) {
                localId++;
                if (id == scope.classId) return localId;
              }
            });
          };
          
          // Sync the class to the zb system. Basic information of the class
          // and every user of the class are pushed.
          scope.sync_class = function() {
            scope.error = null;
            getLocalId().then(function(localId) {
              rpc.get_users(null, scope.classId).then(function(response) {
                var users = scope.users = response.data;
                scope.totalUsers = utils.keys(users).length;
                var oldId = scope.classInfo.zb_id;
                zbapi.sync_class(scope.classInfo, localId, users,
                    scope.study_style).then(function(zb_users) {
                      if (oldId != scope.classInfo.zb_id) {
                        rpc.update_class(scope.classInfo);
                      }
                      zbapi.update_zb_ids(users, zb_users);
                    });
              });
            });
          };
          
          scope.doneUsers = function() {
            if (!scope.users) return 0;

            var done = 0;
            for (var id in scope.users) {
              if (scope.users[id].done) done++;
            }
            return done;
          };
        },
        templateUrl: 'js/zb_sync/zb_sync.html'
      };
    });
});
