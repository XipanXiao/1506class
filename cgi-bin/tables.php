<?php
include_once 'datatype.php';
include_once 'connection.php';

$medoo = get_medoo();


function get_departments() {
  global $medoo;

  return keyed_by_id($medoo->select("departments", "*"));
}

function update_department($department) {
	global $medoo;

	$datas = ["name" => $department["name"]];

	$id = intval($department["id"]);
	if ($id == 0) {
		return $medoo->insert("departments", $datas);
	}
	
	return $medoo->update("departments", $datas, ["id" => $id]);
}

function remove_department($id) {
	global $medoo;

	return $medoo->delete("departments", ["id" => $id]);
}

function get_course_groups($detailed) {
  global $medoo;
  
  $groups = $medoo->select("course_groups", "*");
  
  $result = [];
  foreach ($groups as $group) {
    if ($detailed == "true") {
      $group["courses"] =
          $medoo->select("courses", "*", ["group_id" => $group["id"]]);
    }

    $result[$group["id"]] = $group;
  }

  return $result;
}

function update_course_group($group) {
  global $medoo;
  
  $datas = [];
  $fields = ["department_id", "name", "url"];
  foreach ($fields as $field) {
    if (!empty($group[$field])) {
      $datas[$field] = $group[$field];
    }
  }

  $id = intval($group["id"]);
  if ($id == 0) {
    $id = $medoo->insert("course_groups", $datas);
    if ($id) {
      $group["id"] = $id;
      return $group;
    }
  } elseif($medoo->update("course_groups", $datas, ["id" => $id])) {
    return $group;
  }

  return null;
}

function remove_course_group($id) {
  global $medoo;
  
  $courses = $medoo->select("courses", "*", ["group_id" => $id]);
  if (!empty($courses) && count(courses) > 0) return false;

  return $medoo->delete("course_groups", ["id" => $id]);
}

function remove_schedule_group($id) {
  global $medoo;
  
  $schedules = $medoo->select("schedules", "*", ["group_id" => $id]);
  if (!empty($schedules) && count($schedules) > 0) return false;

  return $medoo->delete("schedule_groups", ["id" => $id]);
}

function remove_class($id) {
  global $medoo;
  
  return $medoo->delete("classes", ["id" => $id]);
}

function remove_task($id) {
  global $medoo;
  
  return $medoo->delete("tasks", ["id" => $id]);
}

function update_course($course) {
  global $medoo;
  
  $datas = [];
  $fields = ["group_id", "name", "video_url", "text_url"];
  foreach ($fields as $field) {
    if (!empty($course[$field])) {
      $datas[$field] = $course[$field];
    }
  }

  $id = intval($course["id"]);
  if ($id == 0) {
    $id = $medoo->insert("courses", $datas);
    if ($id) {
      $course["id"] = $id;
      return $course;
    }
  } elseif($medoo->update("courses", $datas, ["id" => $id])) {
    return $course;
  }

  return null;
}

function remove_course($id) {
  global $medoo;
  
  return $medoo->delete("courses", ["id" => $id]);
}

function remove_schedule($id) {
  global $medoo;
  
  return $medoo->delete("schedules", ["id" => $id]);
}

function get_classes($classId) {
  global $medoo;
  
  function convert_class_record($classInfo) {
    $classInfo["id"] = intval($classInfo["id"]);
    $classInfo["department_id"] = intval($classInfo["department_id"]);
    $classInfo["start_year"] = intval($classInfo["start_year"]);
    $classInfo["perm_level"] = intval($classInfo["perm_level"]);
    return $classInfo;
  }
  
  return keyed_by_id(array_map("convert_class_record",
      $medoo->select("classes", "*", $classId ? ["id" => $classId] : null)));
}

function get_class_id($class_name) {
  global $medoo;
  
  $result = $medoo->select("classes", ["id"], ["name" => $class_name]);
  return empty($result) ? null : $result[0]["id"];
}

function create_class($class_name, $start_year) {
  global $medoo;
  
  $medoo->insert("classes",
      ["name" => $class_name, "start_year" => $start_year]);
  return get_class_id($class_name);
}

function update_class($classInfo) {
  global $medoo;
  
  $datas = [];
  $fields = ["department_id", "name", "class_room", "email", "start_year", 
      "perm_level"];
  foreach ($fields as $field) {
    if (!empty($classInfo[$field])) {
      $datas[$field] = $classInfo[$field];
    }
  }
  
  $id = intval($classInfo["id"]);
  if ($id == 0) {
    return $medoo->insert("classes", $datas);
  }

  return $medoo->update("classes", $datas, ["id" => $id]);
}

function update_task($task) {
  global $medoo;
  
  $datas = [];
  $fields = ["department_id", "name", "max"];
  foreach ($fields as $field) {
    if (!empty($task[$field])) {
      $datas[$field] = $task[$field];
    }
  }
  
  $id = intval($task["id"]);
  if ($id == 0) {
    return $medoo->insert("tasks", $datas);
  }

  return $medoo->update("tasks", $datas, ["id" => $id]);
}

function get_courses($course_group_id) {
  global $medoo;

  return keyed_by_id($medoo->select("courses", "*", 
      ["group_id" => $course_group_id]));
}

function get_user($email) {
  global $medoo;
    
  $result = $medoo->select("users", "*", ["email" => $email]);
  if (empty($result)) return null;
  
  $classes = get_classes($result[0]["classId"]);

  $user = new User($result[0]);
  $user->classInfo = $classes[$user->classId];
  
  return $user;
}

function get_users($email, $classId = null, $user_id = null, $all = null) {
  global $medoo;

  $result = null;
  if ($all) {
    $result = $medoo->select("users", "*");
  } elseif ($classId) {
    $result = $medoo->select("users", "*", ["classId" => $classId]);
  } elseif ($email){
    $result = $medoo->select("users", "*", ["email" => $email]);
  } elseif ($user_id) {
    $result = $medoo->select("users", "*", ["id" => $user_id]);
  }

  if (empty($result)) {
    return [];
  }

  $classes = ($email || $user_id) ? get_classes($result[0]["classId"]) : null;
  $users = array();

  foreach ($result as $index => $row) {
    $user = new User($row);
    $user->password = null;
    $user->classInfo = $classes ? $classes[$user->classId] : null;

    $users[$user->id] = $user;
  }
  
  return $users;
}

function get_admins($permission) {
  global $medoo;

  return keyed_by_id($medoo->select("users", "*",
      ["permission" => $permission]));
}

function remove_user($id) {
  global $medoo;

  return $medoo->delete("users", ["id" => $id]);
}

function update_user($user) {
  global $medoo;

  $datas = [];
  
  $int_fields = ["sex", "mentor_id", "permission", "education", "start_year",
      "classId"];
  $fields = ["internal_id", "name", "nickname", "email",
      "phone", "street", "street2", "city", "state", "country", "zip",
      "im", "occupation", "birthday", "notes"];
  
  foreach ($user as $key => $value) {
    if ($key == "password") {
      $datas[$key] = md5($value);
    } elseif (in_array($key, $int_fields)) {
      $datas[$key] = intval($value);
    } elseif (in_array($key, $fields)) {
      $datas[$key] = $value;
    }
  }

  if (!empty($user["id"]) && intval($user["id"]) > 0) {
    if ($medoo->update("users", $datas, ["id" => intval($user["id"])])) {
      return current(get_users(null, null, intval($user["id"])));
    }
  } else {
    if (empty($datas["classId"]) || intval($datas["classId"]) == 0) {
      $datas["classId"] = 1;
    }
    if (empty($datas["permission"])) {
      $datas["permission"] = 7;
    }
    
    if ($id = $medoo->insert("users", $datas)) {
      return current(get_users(null, null, intval($id)));
    }
  }

  return null;
}

function get_db_error() {
  global $medoo;
  
  $errors = $medoo->error();
  return empty($errors) ? null : $errors[2];
}

function get_last_task_record($user_id, $task_id) {
  global $medoo;
  
  $sql = sprintf("SELECT id, count, ts, sum FROM task_records WHERE 
    student_id=%d AND task_id=%d ORDER BY id DESC LIMIT 1;",
    intval($user_id), intval($task_id));
  $result = $medoo->query($sql)->fetchAll();
  
  if (empty($result)) return null;
  
  $record = current($result);
  return ["count" => intval($record["count"]),
      "ts" => $record["ts"],
      "sum" => intval($record["sum"])
  ];
}

function get_tasks($department_id) {
  global $medoo;

  return $medoo->select("tasks", "*",
      $department_id ? ["department_id" => $department_id] : null);
}

function get_class_task_stats($classId, $task_id) {
  global $medoo;

  $users = $medoo->select("users", ["id", "name"], ["classId" => $classId]);
  foreach ($users as $key => $user) {
    $user["lastRecord"] = get_last_task_record($user["id"], $task_id);
    $users[$key] = $user;
  }
  
  return $users;
}

function report_task($user_id, $task_id, $count, $sum) {
  global $medoo;
  
  return $medoo->insert("task_records", [
    "student_id" => intval($user_id), 
    "task_id" => intval($task_id), 
    "count" => intval($count),
    "sum" => intval($sum)
  ]);
}

function convert_schedule_record($source, $string_to_int = false) {
  $target = [];
  foreach (["video", "text"] as $task) {
    if (isset($source[$task])) {
      if ($string_to_int) {
        $target[$task] = $source[$task] == "true" ? 1 : 0;
      } else {
        $target[$task] = $source[$task] == 1 ? true : false;
      }
    }
  }
  
  if (isset($source["attended"])) {
    $target["attended"] = intval($source["attended"]);
  }

  return $target;
}

function report_schedule_task($user_id, $schedule) {
  global $medoo;
  
  $course_id = intval($schedule["course_id"]);
  $datas = convert_schedule_record($schedule, true);
  
  $rows = $medoo->update("schedule_records", $datas, [
    "AND" => ["course_id" => $course_id, "student_id" => $user_id]
  ]);
  
  if ($rows == 0) {
    $datas["student_id"] = $user_id;
    $datas["course_id"] = $course_id;
    $rows = $medoo->insert("schedule_records", $datas);
  }
  
  return $rows;
}

function keyed_by_id($rows, $id_key = "id") {
  $result = [];

  if (!is_array($rows) || empty($rows)) return $result;
  
  foreach ($rows as $row) {
    $result[$row[$id_key]] = $row;
  }
  
  return $result;
}

function get_schedules($classId, $records, $user_id) {
  global $medoo;
  
  date_default_timezone_set("UTC");

  $schedule_groups =
      keyed_by_id($medoo->select("schedule_groups",
          ["id", "name", "course_group", "classId", "start_time"],
          ["classId" => $classId]));

  foreach ($schedule_groups as $group_id => $group) {
  	$group["start_time"] = (new DateTime($group["start_time"]))->getTimestamp();
    $group["schedules"] = keyed_by_id($medoo->select("schedules", "*",
        ["group_id" => $group_id]));
    
    $group["courses"] =
        keyed_by_id($medoo->select("courses", ["id", "name"],
            ["group_id" => $group["course_group"]]));
    
    $schedule_groups[$group_id] = $group;
  }
  
  $users =
      keyed_by_id($medoo->select("users", ["id", "name"],
          ["classId" => $classId]));
  
  foreach ($users as $id => $user) {
    if ($records == 'none' || $records == 'mine' && $id != $user_id) continue;

    $records =
        keyed_by_id($medoo->select("schedule_records", "*",
            ["student_id" => $id]), "course_id");
      
    $user["records"] = array_map("convert_schedule_record", $records);
    $users[$id] = $user;
  }
      
  return ["groups" => $schedule_groups, "users" => $users ];
}

function update_schedule($schedule) {
  global $medoo;
  
  $datas = ["open" => intval($schedule["open"]),
      "review" => intval($schedule["review"]),
      "course_id" => intval($schedule["course_id"]),
      "group_id" => intval($schedule["group_id"])
  ];
  
  $id = $schedule["id"];
  if ($id == 0) {
    return $medoo->insert("schedules", $datas);
  }

  return $medoo->update("schedules", $datas, ["id" => $id]);
}

function update_schedule_group($group) {
  global $medoo;

  $datas = [];
  $fields = ["classId", "course_group", "name"];
  foreach ($fields as $field) {
    if (!empty($group[$field])) {
      $datas[$field] = $group[$field];
    }
  }
  
  if (!empty($group["start_time"])) {
    date_default_timezone_set("UTC");

  	$dt = new DateTime();
  	$dt->setTimestamp(intval($group["start_time"]));
  	$datas["start_time"] = $dt->format("Y-m-d H:i:s");
  }

  $id = $group["id"];
  if ($id == 0) {
    $id = $medoo->insert("schedule_groups", $datas);
    if (!$id) return false;
    
    foreach ($group["schedules"] as $schedule) {
      $schedule["group_id"] = $id;
      update_schedule($schedule);
    }

    return $id;
  }

  return $medoo->update("schedule_groups", $datas, ["id" => $id]);
}

function search($prefix) {
  global $medoo;
  
  return $medoo->select("users", ["classId", "name", "email"],
      ["OR" => ["name[~]" => $prefix, "email[~]" => $prefix]]);
}
?>
