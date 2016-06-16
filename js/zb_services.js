// Service APIs to the zhibei system at http://db.zhibeifw.com:8888
define('zb_services', ['utils'], function() {
  // All requests are proxied (crossing domain ajax).
  var proxyUrl = 'cgi-bin/proxy.php';
  var redirectUrl = 'cgi-bin/redirect.php';
  var serviceUrl = 'http://db.zhibeifw.com:8888/zb';
  
  function http_form_post($http, data) {
    return $http({
        method: 'POST',
        url: proxyUrl,
        data: data,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  }
  
  function get_proxied_url(url) {
    return proxyUrl + '?url=' + encodeURIComponent(url);
  }
  
  function fixJoinDate(user) {
    var date = new Date(user.ts);
    if (!date.getFullYear()) date = new Date();
    return '' + date.getFullYear() + '-' + (date.getMonth()+1) + 
        '-' + date.getDate();
  }

  return angular.module('ZBServicesModule', ['UtilsModule']).factory('zbrpc',
      function($http, $httpParamSerializerJQLike, utils) {

    function toZBUser(user) {
      utils.setCountryLabels(user);
      return {
        name: user.name,
        sn: user.internal_id,
        gender: 1 - parseInt(user.sex),
        birth_year: parseInt((user.birthday || '-').split('-')[0]),
        district1: user.countryLabel,
        district2: user.stateLabel + '-' + user.city,
        education: user.education + 3,
        lifelong: utils.isBitSet(user.enroll_tasks, utils.permanentIndex) ?
          1 : 0,
        job: user.occupation,
        is_ytb: utils.isBitSet(user.enroll_tasks, utils.workshopIndex) ? 
            1 : 0,
        study_style:
            utils.isBitSet(user.enroll_tasks, utils.selfLearningIndex) ? 
                1 : 0,
        position: '',
        onlywensi: utils.isBitSet(user.enroll_tasks, utils.wensiIndex) ?
            1 : 0,
        joinDate: fixJoinDate(user),
        yy: '',
        yy_No: user.yy || '',
        level: 0
      };
    }
    
    return {
      serviceUrl: serviceUrl,
      get_secure_url: function(url) {
        return '{0}?url={1}'.format(redirectUrl, url);
      },
      getClassUrl: function(pre_classID) {
        return this.get_secure_url('{0}/pre/classinfo?pre_classID={1}'
            .format(serviceUrl, pre_classID));
      },
      is_showing_login_form: function(html) {
        return (html || '').indexOf('<input type="password"') > 0;
      },
      is_authenticated: function() {
        var that = this;
        var url = '{0}/pre/check_edit_password_ajax?type=get_edit_permission'.
            format(serviceUrl);
        return $http.get(get_proxied_url(url)).then(function(response) {
          return parseInt(response.data.edit_permission) == 1;
        });
      },
      get_report_result_url: function(pre_classID, halfTerm) {
        var url = '{0}/pre/report?pre_classID={1}&half_term={2}'.
            format(serviceUrl, pre_classID, halfTerm);
        return this.get_secure_url(url);
      },
      login: function(username, password) {
        var data = {
          'username': username,
          'password': password,
          'url': serviceUrl + '/account/login' 
        };
        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      edit: function(editPassword) {
        var url = ('{0}/pre/check_edit_password_ajax?type=check_edit_password' + 
            '&edit_password={1}').format(serviceUrl, editPassword);
        return $http.get(get_proxied_url(url)).then(function(response) {
          return response.data.returnValue == 'true';
        });
      },
      /// courseId: 加行：1，入行论：2，净土：3
      /// startdate: '2015-06-01'
      /// district1: '美国'
      /// localID: 1, 2, 3, ...
      search_class: function(courseId, startdate, district1, localID) {
        var url = ('{0}/pre/search_ajax?query=preClass' + 
            '&courseId={1}&startdate={2}&district1={3}&localID={4}').format(
            serviceUrl, courseId, startdate, district1, localID);
        return $http.get(get_proxied_url(url));
      },
      /// study: 1 face 2 face, 2 network.
      create_class: function(groupId, courseId, startdate, district1, localID) {
        var data = {
          url: '{0}/pre/classselect_ajax'.format(serviceUrl),
          pre_groupID: groupId,
          type: 'add_pre_class',
          district1: district1,
          district2: '',
          courseID: courseId,
          startDate: startdate,
          localID: localID,
          study_style: 2,
          note: ''
        };
        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      create_user: function(pre_classID, user) {
        var data = toZBUser(user);
        data.url = '{0}/pre/classinfo_ajax'.format(serviceUrl); 
        data.type = 'add_user';
        data.pre_classID = pre_classID;

        return http_form_post($http, $httpParamSerializerJQLike(data))
            .then(function(response) {
              return response.data.returnValue == 'success' ? user : null;
            });
      },
      update_user: function(user) {
        var data = toZBUser(user);
        data.userID = user.zb_id;
        data.url = '{0}/user/basic?userID={1}'.format(serviceUrl, user.zb_id);

        return http_form_post($http, $httpParamSerializerJQLike(data))
            .then(function() {
              return user;
            });
      },
      list_users: function(pre_classID) {
        var url =
            '{0}/pre/classinfo_ajax?type=pre_class_user_list&pre_classID={1}'
                .format(serviceUrl, pre_classID);
        return $http.get(get_proxied_url(url));
      },
      report_schedule_task: function(pre_classID, userID, half_term, book,
          audio) {
        var data = {
          url: '{0}/pre/report_ajax'.format(serviceUrl),
          userID: userID,
          pre_classID: pre_classID,
          type: 'jx_grid',
          half_term: half_term,
          book: book,
          audio: audio
        };
        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      report_preparation_task: function(pre_classID, userID, half_term,
          records) {
        var data = {
          url: '{0}/pre/report_ajax'.format(serviceUrl),
          userID: userID,
          pre_classID: pre_classID,
          type: 'jxWork_grid',
          half_term: half_term,
          dingli_type: 0,
          dingli_count: records.dingli_count || 0,
          guiyi_count: records.guiyi_count || 0,
          lianshi_count: records.lianshi_count || 0
        };
        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      get_preclass_lessions: function(pre_classID, courseID, half_term) {
        var url = ('{0}/pre/report_ajax?courseID={1}&half_term={2}' +
            '&type=pre_class_lessons&pre_classID={3}').format(serviceUrl,
                courseID, half_term, pre_classID);
        return $http.get(get_proxied_url(url));
      },
      report_guanxiu_task: function(pre_classID, userID, half_term,
          count, time) {
        var data = {
          url: '{0}/pre/report_ajax'.format(serviceUrl),
          userID: userID,
          pre_classID: pre_classID,
          type: 'guanxiu_grid',
          half_term: half_term,
          count: count,
          time: time
        };
        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      report_limited_schedule_task: function(pre_classID, userID, half_term,
          book, audio, att) {
        var data = {
            url: '{0}/pre/report_ajax'.format(serviceUrl),
            userID: userID,
            pre_classID: pre_classID,
            type: 'att_limit_grid',
            half_term: half_term,
            book: book,
            audio: audio,
            att: att
          };
          return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      /// Gets data of the 'limit' grid.
      ///
      /// The 'limit' grid contains data of the attendance record and the data
      /// of the 'limited' courses (出席记录和限制性课程传承报数情况).
      get_limit_grid_data: function() {
        var url = ('{0}/pre/report_ajax?type=att_limit_grid' + 
            '&pre_classID={1}&half_term={2}').format(serviceUrl,
            pre_classID, half_term);
        return $http.get(get_proxied_url(url));
      },
      get_root_groups: function() {
        var url = '{0}/pre/classselect_ajax?type=init_root_tree'.
            format(serviceUrl);
        return $http.get(get_proxied_url(url));
      }
    };
  });
});