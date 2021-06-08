define('services', ['utils'], function() {
  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
      });
    };
  }

  var serviceUrl = 'php/services.php';
  var departmentsPromise;
  var organizationPromise;
  var districtPromise;

  // Promise of http.get('/data/Uni2Pinyin.txt'); 
  var pinyinTablePromise;

  function http_form_post($http, data, url, headers) {
    headers = headers || {};
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    return $http({
      method: 'POST',
      url: url || serviceUrl,
      data: data,
      headers: headers
    });
  }

  window.classInfos = {};

  return angular.module('ServicesModule', ['UtilsModule'])
      .factory('rpc', function($http, $httpParamSerializerJQLike, utils) {
        var rpc;
        return rpc = {
          get_departments: function() {
            return departmentsPromise ||
                (departmentsPromise =
                     $http.get(serviceUrl + '?rid=departments'));
          },

          get_classes: function(classId, department_id) {
            var url = '{0}?rid=classes&classId={1}&department_id={2}'.format(
                serviceUrl, classId || '', department_id || '');
            return $http.get(url).then(function(response) {
              utils.forEach(response.data || [], function(classInfo) {
                window.classInfos[classInfo.id] = classInfo;
                classInfo.deleted = (parseInt(classInfo.deleted) != 0);
              });
              return response;
            });
          },

          get_class_candidates: function() {
            return $http.get('{0}?rid=class_candidates'.format(serviceUrl));
          },

          get_class_prefs: function(department_id) {
            var url = '{0}?rid=class_prefs&department_id={1}'.format(
                serviceUrl, department_id || '');
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
              text: schedule.text,
              half_term: schedule.half_term
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

          copy_schedule_group: function(classId, term, toClassId, toTerm) {
            var data = {
              rid: 'copy_schedule_group',
              class_id: classId,
              term: term,
              to_class_id: toClassId,
              to_term: toTerm
            };
            return http_form_post($http, $httpParamSerializerJQLike(data));
          },

          get_tasks: function(department_id) {
            var url = '{0}?rid=tasks&department_id={1}'.format(
                serviceUrl, department_id || '');
            return $http.get(url);
          },

          get_last_task_record: function(task_id, sub_index) {
            if (!sub_index && sub_index != 0) sub_index = '';
            var url = '{0}?rid=task_records&task_id={1}&sub_index={2}'.format(
                serviceUrl, task_id, sub_index);
            return $http.get(url);
          },

          get_class_task_stats: function(
              classId, task_id, start_time, end_time, is_index, indexes) {
            var url = ('{0}?rid=task_stats&classId={1}&task_id={2}' +
                       '&start_time={3}&end_time={4}&is_index={5}' +
                       '&task_indexes={6}')
                          .format(
                              serviceUrl, classId, task_id, start_time || '',
                              end_time || '', is_index || '',
                              indexes && JSON.stringify(indexes) || '');
            return $http.get(url);
          },

          get_task_arranges: function(classId) {
            return $http.get(
                'php/task_arrangements.php?class_id={0}'.format(classId));
          },

          get_courses: function(group_id) {
            return $http
                .get(
                    serviceUrl + '?rid=courses&group_id=' + (group_id || ''),
                    {cache: true})
                .then(function(response) {
                  var courses = response.data;
                  if (!courses || typeof courses == 'string' ||
                      courses instanceof String) {
                    courses = {};
                  }

                  return courses;
                });
          },

          get_users: function(email, classId, sn) {
            return $http.get(
                '{0}?rid=users&email={1}&classId={2}&sn={3}'.format(
                    serviceUrl, email || '', classId || '', sn || ''));
          },

          get_user: function(email) {
            return this.get_users(email).then(function(response) {
              if (response.data.error == 'login needed') {
                utils.login();
              } else if (response.data.error == 'disabled') {
                utils.redirect('./construction.html');
              } else {
                return response.data;
              }
            });
          },

          // records: 'class', 'mine' or 'none'.
          get_schedules: function(classId, term, records) {
            var url =
                '{0}?rid=learning_records&classId={1}&term={2}&records={3}'
                    .format(serviceUrl, classId, term, records || 'none');
            return $http.get(url);
          },

          get_schedule_groups: function(classId) {
            var url = '{0}?rid=schedule_groups&classId={1}'.format(
                serviceUrl, classId);
            return $http.get(url);
          },

          get_task_history: function(userId, taskId) {
            var url = '{0}?rid=task_history&user_id={1}&task_id={2}'.format(
                serviceUrl, userId || '', taskId);
            return $http.get(url);
          },

          get_state_stats: function(countryCode) {
            var url = '{0}?rid=state_stats&country={1}'.format(
                serviceUrl, countryCode);
            return $http.get(url);
          },

          get_state_users: function(countryCode, state) {
            var url = '{0}?rid=state_users&country={1}&state={2}'.format(
                serviceUrl, countryCode, state);
            return $http.get(url);
          },

          get_order: function(order_id) {
            var url = 'php/shop.php?rid=orders&order_id={0}'.format(order_id);
            return $http.get(url);
          },

          get_orders: function(student_id, filters) {
            var url = ('php/shop.php?rid=orders&student_id={0}&year={1}' +
                       '&items={2}&status={3}&class_id={4}')
                          .format(student_id || '', filters.year || '',
                              filters.items || '', filters.status || '',
                              filters.class_id || '');
            return $http.get(url);
          },

          get_items: function(category, level) {
            var url = 'php/shop.php?rid=items&category={0}&level={1}'.format(
                category || '', parseInt(level) || (level === 0 ? 0 : ''));
            return $http.get(url);
          },

          get_item_categories: function(level) {
            var url = 'php/shop.php?rid=item_categories&level={0}'.format(
                parseInt(level) || (level === 0 ? 0 : ''));
            return $http.get(url);
          },

          get_inventory: function(district) {
            var url = 'php/shop.php?rid=inventory&district={0}'.format(
                district || '');
            return $http.get(url);
          },

          get_order_stats: function(year) {
            var url = 'php/shop.php?rid=order_stats&year={0}'.format(year);
            return $http.get(url);
          },

          get_book_list: function(dep_id, term) {
            var url = 'php/shop.php?rid=book_lists&dep_id={0}&term={1}'.format(
                dep_id || '', term || '');
            return $http.get(url);
          },

          get_class_book_lists: function(year) {
            var url = 'php/shop.php?rid=class_book_lists&year={0}'.format(
                year || (new Date()).getFullYear());
            return $http.get(url);
          },

          get_scores: function(classId) {
            var url =
                'php/score.php?rid=scores&class_id={0}'.format(classId || '');
            return $http.get(url);
          },

          update_user: function(user) {
            user.rid = 'user';
            return http_form_post($http, $httpParamSerializerJQLike(user));
          },

          clone_user: function(user_id, newEmail, newClassId) {
            var data = {
              rid: 'clone_user',
              user_id: user_id,
              new_email: newEmail,
              new_class_id: newClassId
            };
            return http_form_post($http, $httpParamSerializerJQLike(data));
          },

          search: function(prefix) {
            return $http.get(serviceUrl + '?rid=search&prefix=' + prefix);
          },

          searchByName: function(name, includeDeleted) {
            return $http.get(
                '{0}?rid=search_name&name={1}&include_deleted={2}'.format(serviceUrl, name,
                  includeDeleted || false));
          },

          getUserLabel: function(id) {
            return $http.get(
                '{0}?rid=user_label&id={1}'.format(serviceUrl, id));
          },

          searchUser: function(query, includeDeleted) {
            var id = parseInt(query);
            if (id) {
              return rpc.getUserLabel(id).then(function(response) {
                return response.data.label;
              });
            } else {
              return rpc.searchByName(query, includeDeleted).then(function(response) {
                return (response.data || []).map(function(user) {
                  user.label = user.nickname ? 
                  '{0}({1})'.format(user.name, user.nickname) : user.name;
                  user.label += '-' + user.email;
                  return user;
                });
              });
            }
          },

          get_course_groups: function(detailed, depId) {
            var url = '{0}?rid=course_groups&detailed={1}&department_id={2}'.format(
                serviceUrl, detailed || false, depId || '');
            return $http.get(url, {cache: true});
          },

          searchCourse: function(query, searchingKey) {
            if (searchingKey && !(query instanceof Array)) {
              query = [parseInt(query)];
            }
            var url = '{0}?rid=course&' +
                ((query instanceof Array) ? 'id={1}' : 'name={1}');
            return $http.get(url.format(serviceUrl, query), {cache: true});
          },

          update_course_group: function(group) {
            group.rid = 'course_group';
            return http_form_post($http, $httpParamSerializerJQLike(group));
          },

          update_order: function(order) {
            order.rid = 'orders';
            return http_form_post(
                $http, $httpParamSerializerJQLike(order), 'php/shop.php');
          },

          merge_orders: function(order_ids) {
            var request = {rid: 'merge_orders', order_ids: order_ids};
            return http_form_post(
                $http, $httpParamSerializerJQLike(request), 'php/shop.php');
          },

          move_order_items: function(fromOrder, toOrder) {
            var request = {
              rid: 'move_items',
              from_order: fromOrder,
              to_order: toOrder
            };
            return http_form_post(
                $http, $httpParamSerializerJQLike(request), 'php/shop.php');
          },

          move_inventory: function(item, fromDistrict, toDistrict) {
            var request = {
              rid: 'move_inventory',
              item: item,
              from_district: fromDistrict,
              to_district: toDistrict
            };
            return http_form_post(
                $http, $httpParamSerializerJQLike(request), 'php/shop.php');
          },

          update_book_list: function(bookList) {
            bookList.rid = 'book_lists';
            return http_form_post(
                $http, $httpParamSerializerJQLike(bookList), 'php/shop.php');
          },

          update_class_term: function(classInfo) {
            classInfo.rid = 'class_book_lists';
            return http_form_post(
                $http, $httpParamSerializerJQLike(classInfo), 'php/shop.php');
          },

          update_item: function(item) {
            item.rid = 'items';
            return http_form_post(
                $http, $httpParamSerializerJQLike(item), 'php/shop.php');
          },

          update_scores: function(scores) {
            var data = {
              rid: 'scores',
              user_id: scores.user_id,
              type1: scores.type1,
              score1: scores.score1,
              type2: scores.type2,
              score2: scores.score2
            };
            return http_form_post(
                $http, $httpParamSerializerJQLike(data), 'php/score.php');
          },

          update_task_arranges: function(
              classId, taskId, start_half_term, report_half_term) {
            var data = {
              class_id: classId,
              task_id: taskId,
              start_half_term: start_half_term,
              report_half_term: report_half_term
            };
            return http_form_post(
                $http, $httpParamSerializerJQLike(data),
                'php/task_arrangements.php');
          },

          remove_course: function(course_id) {
            var url = '{0}?rid=course&id={1}'.format(serviceUrl, course_id);
            return $http.delete(url);
          },

          remove_course_group: function(group_id) {
            var url =
                '{0}?rid=course_group&id={1}'.format(serviceUrl, group_id);
            return $http.delete(url);
          },

          remove_schedule: function(schedule_id) {
            var url = '{0}?rid=schedule&id={1}'.format(serviceUrl, schedule_id);
            return $http.delete(url);
          },

          remove_schedule_group: function(group_id) {
            var url =
                '{0}?rid=schedule_group&id={1}'.format(serviceUrl, group_id);
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
            var url =
                '{0}?rid=department&id={1}'.format(serviceUrl, department_id);
            return $http.delete(url);
          },

          remove_task_record: function(record_id) {
            var url =
                '{0}?rid=task_records&id={1}'.format(serviceUrl, record_id);
            return $http.delete(url);
          },

          remove_order: function(order_id) {
            var url = '{0}?rid=orders&id={1}'.format('php/shop.php', order_id);
            return $http.delete(url);
          },

          remove_order_item: function(id) {
            var url = '{0}?rid=order_details&id={1}'.format('php/shop.php', id);
            return $http.delete(url);
          },

          remove_book_list: function(depId, term) {
            var url = '{0}?rid=book_lists&dep_id={1}&term={2}'.format(
                'php/shop.php', depId, term);
            return $http.delete(url);
          },

          update_course: function(course) {
            course.rid = 'course';
            return http_form_post($http, $httpParamSerializerJQLike(course));
          },

          update_department: function(department) {
            department.rid = 'department';
            return http_form_post(
                $http, $httpParamSerializerJQLike(department));
          },

          /// Given a [zip] code, returns the address.
          lookup: function(zip) {
            var url = 'https://maps.googleapis.com/maps/api/geocode/json?' +
                'address={0}&sensor=true&language=en&key={1}'.format(zip,
                		'AIzaSyAtjIuxegSzX2EKW2TeF1LVizFk7ZtZ9xM');
            return $http.get(url).then(function(response) {
              return response.data.status == 'OK' && response.data.results;
            });
          },

          get_districts: function(country) {
            var url = 'php/district.php?rid=districts&country={0}'.format(
                country || 'US');
            return districtPromise || (districtPromise = $http.get(url));
          },

          update_district: function(district) {
            district.rid = 'districts';
            return http_form_post(
                $http, $httpParamSerializerJQLike(district), 'php/district.php')
                .then(function(res) {
                  if (parseInt(res.data.updated)) {
                    districtPromise = null;
                  }
                  return res;
                });
          },
          
          get_pinyin_table: function() {
        	    if (pinyinTablePromise) return pinyinTablePromise;

        	    var url = 'data/Uni2Pinyin.txt';
        	    return pinyinTablePromise = $http.get(url).then((response) => {
            	  var map = {};
              response.data.split('\n').forEach(function(line) {
      		    if (!line || line.startsWith('#')) return;
      		    var parts = line.split('\t');
      		    var pinyin = (parts[1] || '').replace(/\d$/, '');
      		    map[parts[0]] = pinyin;
              });
              return map;
            });
          },
          
          get_elections: function() {
            return $http.get('php/election.php?rid=elections');
          },
          
          get_candidates: function(election, district) {
            var url = 'php/election.php?rid=candidates' +
                '&election={0}&district={1}'.format(election, district || '');
            return $http.get(url);
          },
          
          get_votes: function(election, user) {
            var url = 'php/election.php?rid=votes' +
                '&election={0}&user={1}'.format(election, user || '');
            return $http.get(url);
          },
          
          update_election: function(election) {
            election.rid = 'elections';
            return http_form_post(
                $http, $httpParamSerializerJQLike(election), 'php/election.php');
          },

          update_candidate: function(candidate) {
            candidate.rid = 'candidates';
            return http_form_post(
                $http, $httpParamSerializerJQLike(candidate), 'php/election.php');
          },

          vote: function(data) {
            data.rid = 'votes';
            return http_form_post(
                $http, $httpParamSerializerJQLike(data), 'php/election.php');
          },
          
          delete_election: function(election) {
            var url = 'php/election.php?rid=elections&id={0}'.format(election);
            return $http.delete(url);
          },

          delete_candidate: function(candidate) {
            var url = 'php/election.php?rid=candidates&id={0}'.format(candidate);
            return $http.delete(url);
          },

          get_district_users: function(district) {
            var url = 'php/district.php?rid=users' +
                '&district={0}'.format(district);
            return $http.get(url);
          },

          upload_image: function(file) {
            return new Promise((resolve) => {
              var reader = new FileReader();
              reader.onload = (event) => {
                var data = {
                  image: event.target.result.split(',')[1]
                };
                http_form_post($http, $httpParamSerializerJQLike(data),
                  'https://api.imgur.com/3/upload', {
                    'Authorization': 'Client-ID 716d920ab67e2e0'
                  }).then((response) => {
                    resolve(response.data.data.link);
                  });
              };
              reader.readAsDataURL(file);
            });
          },

          get_vote_users: function(election, district) {
            var url = 'php/election.php?rid=users' +
                '&election={0}&district={1}'.format(election, district || '');
            return $http.get(url);
          },
          
          delete_vote: function(id) {
            var url = 'php/election.php?rid=votes&id={0}'.format(id);
            return $http.delete(url);
          },

          get_organizations: function() {
            if (organizationPromise) return organizationPromise;
            var url = 'php/organization.php?rid=organizations';
            return organizationPromise = $http.get(url);
          },

          get_staff: function(user) {
            var url = 'php/organization.php?rid=staff&user={0}'.format(user || '');
            return $http.get(url);
          },

          update_staff: function(staff) {
            staff.rid = 'staff';
            return http_form_post(
                $http, $httpParamSerializerJQLike(staff), 'php/organization.php');
          },

          delete_staff: function(id) {
            var url = 'php/organization.php?rid=staff&id={0}'.format(id);
            return $http.delete(url);
          },

          attendanceStats: function(user_id) {
            var url = '{0}?rid=attendance&user_id={1}'.format(
              serviceUrl, user_id || '');
            return $http.get(url);
          }
        };
      });
});
