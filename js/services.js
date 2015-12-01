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

	var serviceUrl = "cgi-bin/services.php?";
	
	function http_form_post($http, data) {
		return $http({
		    method: "POST",
		    url: serviceUrl,
		    data: data,
		    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		});
	}

	return angular.module('ServicesModule', []).factory('rpc', function($http, 
			$httpParamSerializerJQLike) {
		return {
			get_classes: function(class_id) {
				if (!class_id) {
					class_id = '';
				}
				
				return $http.get(serviceUrl + "rid=classes&class_id=" + class_id);
			},
		
			report_task: function(task_id, count) {
				var data = {"rid": "tasks", "task_id": task_id, "count": count};
				return http_form_post($http, $httpParamSerializerJQLike(data));
			},
		
			report_schedule_task: function(schedule) {
				schedule.rid = "schedule_tasks";
				return http_form_post($http, $httpParamSerializerJQLike(schedule));
			},
		
			get_group_tasks: function() {
				return $http.get(serviceUrl + "rid=tasks");
			},
		
			get_last_task_record: function(task_id) {
				return $http.get(serviceUrl + "rid=tasks&pos=last&task_id=" + task_id);
			},
			
			get_schedules: function(with_records, class_id) {
				if (!class_id) {
					class_id = '';
				}
				
				if (with_records != true) {
					with_records = false;
				}
				
				var url = "{0}rid=schedules&with_records={1}&class_id={2}"
					.format(serviceUrl, with_records, class_id);

				return $http.get(url);
			},

			get_courses: function(group_id) {
				if (!group_id) {
					group_id = '';
				}
				
				return $http.get(serviceUrl + "rid=courses&group_id=" + group_id);
			},
			
			get_users: function(email) {
				if (!email) {
					email = '';
				}
				
				return $http.get(serviceUrl + "rid=users&email=" + email);
			}
		};
	});
});
