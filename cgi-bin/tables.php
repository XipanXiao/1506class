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
  
  return keyed_by_id($medoo->select("classes", "*",
  		$class_id ? ["id" => $class_id] : null));
}

function get_courses($course_group_id) {
  global $medoo;

  return $medoo->select("courses", "*", ["group_id" => $course_group_id]);
}

function get_users($email, $class_id = null) {
  global $medoo;

  $result = null;
  if ($class_id) {
    $result = $medoo->select("users", "*", ["class_id" => $class_id]);
  } elseif ($email){
    $result = $medoo->select("users", "*", ["email" => $email]);
  }

  $classes = $email ? get_classes($result[0]["class_id"]) : null;
  $users = array();
  
  foreach ($result as $index => $row) {
    $user = new User($row);
    $user->classInfo = $classes ? $classes[$user->classId] : null;

    $users[$index] = $user;
  }
  
  return $users;
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
    
  $datas = convert_schedule_record($schedule, true);
  $datas["student_id"] = $user_id;
  $datas["schedule_id"] = $schedule["id"];
  
  $rows = $medoo->update("schedule_records", $datas, [
    "AND" => ["schedule_id" => $schedule["id"], "student_id" => $user_id]
  ]);
  
  if ($rows == 0) {
    $rows = $medoo->insert("schedule_records", $datas);
  }
  
  return $rows;
}

function get_schedule_records($user_id) {
  global $medoo;

  $records = $medoo->select("schedule_records", "*",
  		["student_id" => $user_id]);
  
  $result = array();
  foreach ($records as $record) {
    $result[$record["schedule_id"]] = $record;
  }
  
  return $result;
}

function mixin($target, $source) {
  foreach ($source as $key => $value) {
    $target[$key] = $value;
  }
  
  return $target;
}

function keyed_by_id($rows, $id_key = "id") {
  $result = array();

  if (empty($rows)) return $result;
  
  foreach ($rows as $row) {
    $result[$row[$id_key]] = $row;
  }
  
  return $result;
}

function get_schedules_for_group($group, $schedule_records, $class_mates) {
  global $medoo;

  $group_id = $group["id"];
  $schedules = keyed_by_id($medoo->select("schedules", "*",
  		["group_id" => $group_id]));
  $courses = get_courses($group["course_group"]);

  $index = 0;
  $a_week = date_interval_create_from_date_string("7 days");
  $start_time = new DateTime();
  $start_time->setTimestamp(strtotime($group["start_time"]));
  
  foreach ($schedules as $schedule_id => $schedule) {
    $schedule["dt"] = $start_time->format("Y-m-d H:i");
    $start_time = $start_time->add($a_week);
    if ($schedule["open"] == 0) {
      $schedule["course_name"] = "放假";
      $schedule["open"] = "";
      $schedule["review"] = "";
    } else {
      $schedule["open"] = $class_mates[$schedule["open"]]->name;
      $schedule["review"] = 
        $schedule["review"] == 0 ? "" : $class_mates[$schedule["review"]]->name;
      
      $schedule["course_name"] = $courses[$index++]["name"];
    }
    
    $schedules[$schedule_id] = $schedule;
  }

  if ($schedule_records) {
    foreach ($schedule_records as $record) {
      $schedule_id = $record["schedule_id"];
      $schedule = $schedules[$schedule_id];
      $record = convert_schedule_record($record, false);
      $schedules[$schedule_id] = mixin($schedule, $record);
    }
  }
  
  return $schedules;
}

function get_schedules($user, $with_records) {
  global $medoo;

  date_default_timezone_set("America/Los_Angeles");
  
  $schedule_groups =
  		keyed_by_id($medoo->select("schedule_groups", "*",
  				["class_id" => $user->classId]));
  $schedule_records = $with_records ? get_schedule_records($user->id) : null;
  $class_mates = get_users(null, $user->classId);
  
  foreach ($schedule_groups as $group_id => $group) {
    $group["schedules"] =
    		get_schedules_for_group($group, $schedule_records, $class_mates);
    $schedule_groups[$group_id] = $group;
  }
  
  return $schedule_groups;
}

function get_learning_records($class_id) {
  global $medoo;
  
  $schedule_groups =
  		$medoo->select("schedule_groups", ["id", "course_group"],
  				["class_id" => $class_id]);
  for ($g = 0; $g < count($schedule_groups); $g++) {
    $group = $schedule_groups[$g];
    
    $sql =
    		sprintf("select id from schedules where group_id=%d and open != 0;",
    				$group["id"]);
    $schedules = $medoo->query($sql)->fetchAll();
    
    $courses = get_courses($group["course_group"]);
    for ($i = 0;$i < count($schedules); $i++) {
      $schedules[$i]["course_name"] = $courses[$i]["name"];
    }
    
    $users = $medoo->select("users", ["id", "name"], ["class_id" => $class_id]);
    for ($i = 0;$i < count($users); $i++) {
      $user = $users[$i];
      
      $records =
      		keyed_by_id($medoo->select("schedule_records", "*",
      				["student_id" => $user["id"]]), "schedule_id");
      
      $user["records"] = array_map("convert_schedule_record", $records);
      $users[$i] = $user;
    }
    
    $group["schedules"] = $schedules;
    $group["users"] = $users;
    
    $schedule_groups[$g] = $group;
  }
  
  return $schedule_groups;
}
?>
