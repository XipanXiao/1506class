define('services', [], function() {
  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number]
            : match;
      });
    };
  }

  var serviceUrl = 'cgi-bin/services.php';
  
  function http_form_post($http, data) {
    return $http({
        method: 'POST',
        url: serviceUrl,
        data: data,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  }

  return angular.module('ServicesModule', []).factory('rpc', function($http, 
      $httpParamSerializerJQLike) {
    return {
      get_departments: function() {
        return $http.get(serviceUrl + '?rid=departments');
      },
    
      get_classes: function(classId, department_id) {
        var url = '{0}?rid=classes&classId={1}&department_id={2}'.
            format(serviceUrl, classId || '', department_id || '');
        return $http.get(url);
      },
      
      get_class_candidates: function() {
        return $http.get('{0}?rid=class_candidates'.format(serviceUrl));
      },
      
      get_class_prefs: function(department_id) {
        var url = '{0}?rid=class_prefs&department_id={1}'.
            format(serviceUrl, department_id);
        return $http.get(url);
      },
      
      update_class_prefs: function(prefs) {
        prefs.rid = 'class_prefs';
        return http_form_post($http, $httpParamSerializerJQLike(prefs));
      },
      
      update_class: function(classInfo) {
        classInfo.rid = 'class';
        return http_form_post($http, $httpParamSerializerJQLike(classInfo));
      },
    
      update_task: function(task) {
        task.rid = 'task';
        return http_form_post($http, $httpParamSerializerJQLike(task));
      },
    
      report_task: function(task) {
        task.rid = 'tasks';
        return http_form_post($http, $httpParamSerializerJQLike(task));
      },
    
      report_schedule_task: function(schedule) {
        var data = {
            rid: 'schedule_tasks',
            student_id: schedule.student_id,
            course_id: schedule.course_id,
            attended: schedule.attended,
            video: schedule.video,
            text: schedule.text
        };

        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
    
      update_schedule: function(schedule) {
        schedule.rid = 'schedule';
        return http_form_post($http, $httpParamSerializerJQLike(schedule));
      },
      
      update_schedule_group: function(group) {
        group.rid = 'schedule_group';
        return http_form_post($http, $httpParamSerializerJQLike(group));
      },
    
      get_tasks: function(department_id) {
        var url = '{0}?rid=tasks&department_id={1}'.format(serviceUrl,
            department_id || '');
        return $http.get(url);
      },
    
      get_last_task_record: function(task_id, sub_index) {
        if (!sub_index && sub_index != 0) sub_index = '';
        var url = '{0}?rid=task_records&task_id={1}&sub_index={2}'.format(
            serviceUrl, task_id, sub_index);
        return $http.get(url);
      },
      
      get_class_task_stats: function(classId, task_id, start_time, end_time,
          is_index) {
        var url =('{0}?rid=task_stats&classId={1}&task_id={2}' +
            '&start_time={3}&end_time={4}&is_index={5}').format(serviceUrl,
            classId, task_id, start_time || '', end_time || '', is_index || '');
        return $http.get(url);
      },
      
      get_courses: function(group_id) {
        return $http.get(serviceUrl + '?rid=courses&group_id=' + 
            (group_id || ''), {cache: true}).then(function(response) {
              var courses = response.data;
              if (!courses || typeof courses == 'string' ||
                  courses instanceof String) {
                courses = {};
              }
              
              return courses;
            });
      },
      
      get_users: function(email, classId, sn) {
        return $http.get('{0}?rid=users&email={1}&classId={2}&sn={3}'.
            format(serviceUrl, email || '', classId || '', sn || ''));
      },
      
      get_user: function(email) {
        return this.get_users(email).then(function(response) {
          if (response.data.error == "login needed") {
            window.location.href = "./login.html";
          } else {
            return response.data;
          }
        });
      },
      
      get_admins: function(permission) {
        var url = "{0}?rid=admins&permission={1}".format(serviceUrl,
            permission);
        return $http.get(url);
      },

      // records: 'class', 'mine' or 'none'.
      get_schedules: function(classId, term, records) {
        var url = "{0}?rid=learning_records&classId={1}&term={2}&records={3}".
            format(serviceUrl, classId, term, records || 'none');
        return $http.get(url);
      },
      
      get_task_history: function(userId, taskId) {
        var url = "{0}?rid=task_history&user_id={1}&task_id={2}".
            format(serviceUrl, userId || '', taskId);
        return $http.get(url);
      },
      
      get_state_stats: function(countryCode) {
        var url = "{0}?rid=state_stats&country={1}".
            format(serviceUrl, countryCode);
        return $http.get(url);
      },
      
      get_state_users: function(countryCode, state) {
        var url = "{0}?rid=state_users&country={1}&state={2}".
            format(serviceUrl, countryCode, state);
        return $http.get(url);
      },
      
      get_order: function(order_id) {
        var url = "{0}?rid=orders&order_id={1}".format(serviceUrl, order_id);
        return $http.get(url);
      },
      
      get_orders: function(student_id, start, end) {
        var url = "{0}?rid=orders&student_id={1}&start={2}&end={3}".
            format(serviceUrl, student_id || '', start || '', end || '');
        return $http.get(url);
      },
      
      update_user: function(user) {
        user.rid = 'user';
        return http_form_post($http, $httpParamSerializerJQLike(user));
      },
      
      search: function(prefix) {
        return $http.get(serviceUrl + '?rid=search&prefix=' + prefix);
      },
      
      get_course_groups: function(detailed) {
        var url = "{0}?rid=course_groups&detailed={1}".format(serviceUrl,
            detailed || false);
        return $http.get(url, {cache: true});
      },

      update_course_group: function(group) {
        group.rid = 'course_group';
        return http_form_post($http, $httpParamSerializerJQLike(group));
      },
      
      update_order: function(order) {
        order.rid = 'orders';
        return http_form_post($http, $httpParamSerializerJQLike(order));
      },
      
      remove_course: function(course_id) {
        var url = '{0}?rid=course&id={1}'.format(serviceUrl, course_id);
        return $http.delete(url);
      },
      
      remove_course_group: function(group_id) {
        var url = '{0}?rid=course_group&id={1}'.format(serviceUrl, group_id);
        return $http.delete(url);
      },
      
      remove_schedule: function(schedule_id) {
        var url = '{0}?rid=schedule&id={1}'.format(serviceUrl, schedule_id);
        return $http.delete(url);
      },

      remove_schedule_group: function(group_id) {
        var url = '{0}?rid=schedule_group&id={1}'.format(serviceUrl, group_id);
        return $http.delete(url);
      },

      remove_class: function(classId) {
        var url = '{0}?rid=class&id={1}'.format(serviceUrl, classId);
        return $http.delete(url);
      },

      remove_task: function(task_id) {
        var url = '{0}?rid=task&id={1}'.format(serviceUrl, task_id);
        return $http.delete(url);
      },

      remove_user: function(user_id) {
        var url = '{0}?rid=user&id={1}'.format(serviceUrl, user_id);
        return $http.delete(url);
      },

      remove_department: function(department_id) {
        var url = '{0}?rid=department&id={1}'.format(serviceUrl, department_id);
        return $http.delete(url);
      },

      remove_task_record: function(record_id) {
        var url = '{0}?rid=task_records&id={1}'.format(serviceUrl, record_id);
        return $http.delete(url);
      },

      remove_order: function(order_id) {
        var url = '{0}?rid=orders&id={1}'.format(serviceUrl, order_id);
        return $http.delete(url);
      },

      update_course: function(course) {
        course.rid = 'course';
        return http_form_post($http, $httpParamSerializerJQLike(course));
      },

      update_department: function(department) {
        department.rid = 'department';
        return http_form_post($http, $httpParamSerializerJQLike(department));
      },

      /// Given a [zip] code, returns the address.
      lookup: function(zip) {
        var url = 'http://maps.googleapis.com/maps/api/geocode/json?' + 
            'address={0}&sensor=true'.format(zip);
        return $http.get(url).then(function(response) {
          return response.data.status == 'OK' && response.data.results[0];
        });
      }
    };
  });
});
