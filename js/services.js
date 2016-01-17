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

  var userPromise;
  var classMatesPromises = {};
  var learningRecordsPromise = {};
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
      get_class_groups: function() {
        return $http.get(serviceUrl + '?rid=class_groups');
      },
    
      get_classes: function(classId) {
        var url = '{0}?rid=classes&classId={1}'.format(serviceUrl,
            classId || '');
        return $http.get(url, {cache: true});
      },
      
      update_class: function(classInfo) {
        classInfo.rid = 'class';
        return http_form_post($http, $httpParamSerializerJQLike(classInfo));
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
    
      get_group_tasks: function() {
        return $http.get(serviceUrl + '?rid=tasks');
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
        group_id = group_id || '';
        
        return $http.get(serviceUrl + '?rid=courses&group_id=' + group_id);
      },
      
      get_users: function(email, classId) {
        email = email || '';
        classId = classId || '';

        if (!email && !classId && userPromise) return userPromise;
        if (!email && classId && classMatesPromises[classId]) {
          return classMatesPromises[classId];
        }
        
        var promise = $http.get('{0}?rid=users&email={1}&classId={2}'.
            format(serviceUrl, email, classId));
        if (!email && !classId) {
          userPromise = promise;
        }
        if (!email && classId) {
          classMatesPromises[classId] = promise;
        }
        
        return promise;
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
      
      // records: 'class', 'mine' or 'none'.
      get_schedules: function(classId, records) {
        if (learningRecordsPromise[classId]) {
          return learningRecordsPromise[classId];
        }
        
        var url = "{0}?rid=learning_records&classId={1}&records={2}".
            format(serviceUrl, classId, records || 'none');
        return learningRecordsPromise[classId] = $http.get(url);
      },
      
      update_user: function(user) {
        user.rid = 'user';
        return http_form_post($http, $httpParamSerializerJQLike(user));
      },
      
      search: function(prefix) {
        return $http.get(serviceUrl + '?rid=search&prefix=' + prefix);
      },
      
      get_file: function(url) {
        return $http.get(url, {cache: true});
      }
    };
  });
});
