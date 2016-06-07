// APIs to the zhibei system at http://db.zhibeifw.com:8888
define('zb_api', ['services', 'zb_services'], function() {
  return angular.module('ZBAPIModule', ['ServicesModule', 'ZBServicesModule'])
      .factory('zbapi', function($q, rpc, zbrpc) {
    return {
      // deparment 1: 基础班
      // deparment 2: 入行论班
      // deparment 3: 加行班
      // deparment 4: 净土班
      // courseId: 加行：1，入行论：2，净土：3
      get_zb_courseId: function(departmentId) {
        return {
          2: 2,
          3: 1,
          4: 3
        }[departmentId];
      },
      sync_users: function(pre_classID, users) {
        var that = this;
        return zbrpc.list_users(pre_classID).then(function(response) {
          var zb_users = response.data.data;
          that.update_zb_ids(users, zb_users);

          var userPromises = [];
          for (var id in users) {
            userPromises.push(that.sync_user(pre_classID, users[id]));
          }
          return $q.all(userPromises).then(function(results) {
            return zbrpc.list_users(pre_classID).then(function(response) {
              return response.data.data;
            });
          });
        });
      },
      /// courseId: 加行：1，入行论：2，净土：3
      /// startdate: '2015-06-01'
      /// district1: '美国'
      /// localID: 1, 2, 3, ...
      sync_class: function(classInfo, localID, users, study_style) {
        if (classInfo.zb_id) {
          return this.sync_users(classInfo.zb_id, users);
        }
        var that = this;
        // courseId, startdate, district1, localID
        var courseId = this.get_zb_courseId(classInfo.department_id);
        var startdate = '' + classInfo.start_year + '-06-01';
        return zbrpc.search_class(courseId, startdate, '美国', localID)
            .then(function(response) {
              var results = response.data.data;
              if (results && results[0]) {
                classInfo.zb_id = results[0].pre_classID;
                return that.sync_users(classInfo.zb_id, users);
              }
              return zbrpc.create_class(courseId, startdate, '美国', localID,
                  study_style).then(function(response) {
                    classInfo.zb_id = response.data.pre_classID;
                    return classInfo.zb_id ? 
                        that.sync_users(classInfo.zb_id, users) : null;
                  });
            });
      },
      sync_user: function(classId, user) {
        return user.zb_id ? zbrpc.update_user(user) :
          zbrpc.create_user(classId, user);
      },
      /// Store zb ids for corresponding users in database.
      update_zb_ids: function(users, zb_users) {
        var zb_users_map = {};
        zb_users.forEach(function(zb_user) {
          zb_users_map[zb_user.name] = zb_user;
        });

        for (var id in users) {
          var user = users[id];
          var zb_user = zb_users_map[user.name];
          var oldId = user.zb_id;

          user.zb_id = zb_user && zb_user.userID;
          if (parseInt(oldId) != parseInt(user.zb_id)) {
            rpc.update_user(user);
          }
          user.done = user.zb_id;
        }
      }
    };
  });
});
