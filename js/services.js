if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function get_classes($http) {
	return $http.get("services.php?rid=classes");
}

function http_form_post($http, data) {
	return $http({
	    method: "POST",
	    url: "services.php",
	    data: data,
	    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	});
}

function report_task($http, $httpParamSerializerJQLike, task_id, count) {
	var data = {"rid": "tasks", "task_id": task_id, "count": count};
	return http_form_post($http, $httpParamSerializerJQLike(data));
}

function get_group_tasks($http) {
	return $http.get("services.php?rid=tasks");
}

function get_last_task_record($http, task_id) {
	return $http.get("services.php?rid=tasks&pos=last&task_id=" + task_id);
}
