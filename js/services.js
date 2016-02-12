define(function() {
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
    
      get_classes: function(classId) {
        var url = '{0}?rid=classes&classId={1}'.format(serviceUrl,
            classId || '');
        return $http.get(url);
      },
      
      update_class: function(classInfo) {
        classInfo.rid = 'class';
        return http_form_post($http, $httpParamSerializerJQLike(classInfo));
      },
    
      update_task: function(task) {
        task.rid = 'task';
        return http_form_post($http, $httpParamSerializerJQLike(task));
      },
    
      report_task: function(task_id, count, sum) {
        var data = {'rid': 'tasks', 
            'task_id': task_id, 
            'count': count, 
            'sum': sum};
        return http_form_post($http, $httpParamSerializerJQLike(data));
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
    
      get_last_task_record: function(task_id) {
        return $http.get(serviceUrl + '?rid=tasks&pos=last&task_id=' + task_id);
      },
      
      get_class_task_stats: function(classId, task_id) {
        var url = '{0}?rid=task_stats&classId={1}&task_id={2}'.format(
            serviceUrl, classId, task_id);
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
      
      get_users: function(email, classId, all) {
        return $http.get('{0}?rid=users&email={1}&classId={2}&all={3}'.
            format(serviceUrl, email || '', classId || '', all || ''));
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
      get_schedules: function(classId, records) {
        var url = "{0}?rid=learning_records&classId={1}&records={2}".
            format(serviceUrl, classId, records || 'none');
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

      update_course: function(course) {
        course.rid = 'course';
        return http_form_post($http, $httpParamSerializerJQLike(course));
      },

      update_department: function(department) {
        department.rid = 'department';
        return http_form_post($http, $httpParamSerializerJQLike(department));
      }
    };
  });
});
