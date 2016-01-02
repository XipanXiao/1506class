<?php
include_once 'datatype.php';
include_once 'connection.php';

$medoo = get_medoo();


function get_class_groups() {
  global $medoo;

  return $medoo->select("class_groups", "*");
}

function get_classes($class_id) {
  global $medoo;
  
  function convert_class_record($classInfo) {
  	$classInfo["id"] = intval($classInfo["id"]);
  	$classInfo["department_id"] = intval($classInfo["department_id"]);
  	$classInfo["start_year"] = intval($classInfo["start_year"]);
  	return $classInfo;
  }
  
  return keyed_by_id(array_map("convert_class_record",
  		$medoo->select("classes", "*", $class_id ? ["id" => $class_id] : null)));
}

function get_courses($course_group_id) {
  global $medoo;

  return keyed_by_id($medoo->select("courses", "*", ["group_id" => $course_group_id]));
}

function get_users($email, $class_id = null, $user_id = null) {
  global $medoo;

  $result = null;
  if ($class_id) {
    $result = $medoo->select("users", "*", ["class_id" => $class_id]);
  } elseif ($email){
    $result = $medoo->select("users", "*", ["email" => $email]);
  } elseif ($user_id) {
  	$result = $medoo->select("users", "*", ["id" => $user_id]);
  }

  $classes = ($email || $user_id) ? get_classes($result[0]["class_id"]) : null;
  $users = array();

  foreach ($result as $index => $row) {
    $user = new User($row);
    $user->classInfo = $classes ? $classes[$user->classId] : null;

    $users[$user->id] = $user;
  }
  
  return $users;
}

function update_user($user) {
  global $medoo;

  $datas = [];
  
  $int_fields = ["sex", "mentor", "permission"];
  $ignore_fields = ["id", "rid", "classId"];
  
  foreach ($user as $key => $value) {
    if (in_array($key, $int_fields)) {
      $datas[$key] = intval($value);
    } elseif (!in_array($key, $ignore_fields)) {
      $datas[$key] = $value;
    }
  }
  
  if ($user["classId"]) {
  	$datas["class_id"] = intval($user["classId"]);
  }
  
  if ($medoo->update("users", $datas, ["id" => intval($user["id"])])) {
    return current(get_users(null, null, intval($user["id"])));
  }

  return null;
}

function get_last_task_record($user_id, $task_id) {
  global $medoo;
  
  $sql = sprintf("SELECT count, ts FROM task_records WHERE 
    student_id=%d AND task_id=%d ORDER BY ts DESC LIMIT 1;",
    $user_id, $task_id);
  $result = $medoo->query($sql)->fetchAll();
  
  return empty($result) ? null : current($result); 
}

function task_sum($user_id, $task_id) {
  global $medoo;
  
  $sql = sprintf("SELECT sum(count) FROM task_records".
      " WHERE student_id=%d AND task_id=%d;", $user_id, $task_id);
  $sum = current(current($medoo->query($sql)->fetchAll()));
  return $sum == null ? 0 : $sum;
}

function get_tasks($department_id) {
  global $medoo;

  return $medoo->select("tasks", "*", ["department_id" => $department_id]);
}

function report_task($user_id, $task_id, $count) {
  global $medoo;
  
  $medoo->insert("task_records", [
    "student_id" => $user_id, 
    "task_id" => $task_id, 
    "count" => $count]);
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
  $result = array();

  if (empty($rows)) return $result;
  
  foreach ($rows as $row) {
    $result[$row[$id_key]] = $row;
  }
  
  return $result;
}

function get_schedules($class_id, $records, $user_id) {
  global $medoo;
  
  date_default_timezone_set("America/Los_Angeles");
  $schedule_groups =
      keyed_by_id($medoo->select("schedule_groups",
          ["id", "name", "course_group", "class_id", "start_time"],
      		["class_id" => $class_id]));

  $a_week = date_interval_create_from_date_string("7 days");
  $start_time = new DateTime();

  foreach ($schedule_groups as $group_id => $group) {
    $schedules = keyed_by_id($medoo->select("schedules", "*",
        ["group_id" => $group_id]));
    
	  $start_time->setTimestamp(strtotime($group["start_time"]));

    $courses = get_courses($group["course_group"]);
    foreach ($schedules as $schedule) {
	    $schedule["dt"] = $start_time->format("Y-m-d H:i");
	    $start_time = $start_time->add($a_week);

	    $course_id = intval($schedule["course_id"]);
      $schedule["course_id"] = $course_id;
      $schedule["course_name"] =
          $course_id ? $courses[$course_id]["name"] : "放假";
      $schedules[$schedule["id"]] = $schedule;
    }
    
    $group["schedules"] = $schedules;
    $schedule_groups[$group_id] = $group;
  }
  
  $users =
      keyed_by_id($medoo->select("users", ["id", "name"],
          ["class_id" => $class_id]));
  
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

  return $medoo->update("schedules", ["open" => intval($schedule["open"]),
      "review" => intval($schedule["review"])], ["id" => $schedule["id"]]);
}

function search($prefix) {
	global $medoo;
	
	return $medoo->select("users", ["class_id", "name", "email"],
			["OR" => ["name[~]" => $prefix, "email[~]" => $prefix]]);
}
?>
