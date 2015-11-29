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

	function http_form_post($http, data) {
		return $http({
		    method: "POST",
		    url: "services.php",
		    data: data,
		    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		});
	}

	return angular.module('ServicesModule', []).factory('rpc', function($http, 
			$httpParamSerializerJQLike) {
		return {
			get_classes: function() {
				return $http.get("services.php?rid=classes");
			},
		
			report_task: function(task_id, count) {
				var data = {"rid": "tasks", "task_id": task_id, "count": count};
				return http_form_post($http, $httpParamSerializerJQLike(data));
			},
		
			get_group_tasks: function() {
				return $http.get("services.php?rid=tasks");
			},
		
			get_last_task_record: function(task_id) {
				return $http.get("services.php?rid=tasks&pos=last&task_id=" + task_id);
			},
			
			get_schedules: function(class_id) {
				if (!class_id) {
					class_id = '';
				}
				
				return $http.get("services.php?rid=schedules&class_id=" + class_id);
			},

			get_courses: function(group_id) {
				if (!group_id) {
					group_id = '';
				}
				
				return $http.get("services.php?rid=courses&group_id=" + group_id);
			}
		};
	});
});
