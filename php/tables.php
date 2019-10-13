<?php
include_once "datatype.php";
include_once "connection.php";
include_once "permission.php";
include_once "util.php";

$medoo = get_medoo();

function convert_int_fields($record, $int_fields) {
  foreach ($int_fields as $field) {
    $record[$field] = intval($record[$field]);
  }

  return $record;
}

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

function get_course_groups($detailed, $department_id = null) {
  global $medoo;

  $where = empty($department_id) 
      ? ""
      : sprintf(" WHERE department_id is NULL OR department_id=%d", $department_id);
  $groups = $medoo->query("SELECT * FROM course_groups". $where)->fetchAll();
  
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
  $fields = ["department_id", "name", "category"];
  foreach ($fields as $field) {
    if (!empty($group[$field])) {
      $datas[$field] = $group[$field];
    }
  }

  $id = empty($group["id"]) ? 0 : intval($group["id"]);
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

  // This line may return false if there is no schedules in the group.
  $medoo->delete("schedules", ["group_id" => $id]);

  return $medoo->delete("schedule_groups", ["id" => $id]);
}

function remove_class_schedule_group($classId, $term) {
  global $medoo;

  $groupIds = $medoo->select("schedule_groups", "id",
      ["AND" => ["classId" => $classId, "term" => $term]]);
  foreach ($groupIds as $id) {
    remove_schedule_group($id);
  }
}

function copy_schedule_group($classId, $term, $toClassId, $toTerm) {
  $groups = get_schedules($classId, $term, "none", null)["groups"];
  if (empty($groups)) return 0;

  $updated = 0;
  foreach ($groups as $group) {
    $group["id"] = 0;
    $group["classId"] = $toClassId;
    $group["term"] = $toTerm;
    $updated += update_schedule_group($group);
  }
  return $updated;
}

function remove_class($id) {
  global $medoo;
 
  if (intval($id) == 1) return 0;

  // If there is no reference to this class, it's deleted from the DB.
  $deleted = $medoo->delete("classes", ["id" => $id]);
  if ($deleted) return $deleted;

  // If there are users, cannot mark it as 'deleted'.
  $users = $medoo->count("users", ["classId" => $id]);
  if ($users) return 0;
  
  // Mark it as 'deleted'.
  return $medoo->update("classes", ["deleted" => 1], ["id" => $id]);
}

function remove_task($id) {
  global $medoo;
  
  return $medoo->delete("tasks", ["id" => $id]);
}

function update_course($course) {
  global $medoo;
  
  $datas = [];
  $fields = ["group_id", "name", "video_url", "text_url", "zb_name"];
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

function get_classes($filters = []) {
  global $medoo;
  
  $int_fields = ["id", "department_id", "teacher_id", "start_year",
      "perm_level", "weekday", "zb_id", "teacher2_id", "graduated",
      "district"];
  $filters = array_merge($filters, ["deleted" => 0]);
  $classes = keyed_by_id($medoo->select("classes", "*", ["AND" => $filters]));

  foreach ($classes as $id => $classInfo) {
    $classInfo["self_report"] = isset($classInfo["self_report"])
        && intval($classInfo["self_report"]) == 1;
    $classes[$id] = convert_int_fields($classInfo, $int_fields);
  }
  return $classes;
}

function get_class_id($class_name) {
  global $medoo;
  
  $result = $medoo->select("classes", ["id"], ["name" => $class_name]);
  return empty($result) ? null : $result[0]["id"];
}

function update_class($classInfo) {
  global $medoo;
  
  $datas = [];
  $fields = ["department_id", "name", "class_room", "email", "start_year", 
      "perm_level", "weekday", "time", "zb_id", "teacher_id", "teacher2_id",
      "graduated", "district"];

  foreach ($fields as $field) {
    if (isset($classInfo[$field])) {
      $datas[$field] = $classInfo[$field];
    }
  }
  
  if (empty($datas['teacher_id'])) {
    $datas['teacher_id'] = null;
  }
  if (empty($datas['teacher2_id'])) {
    $datas['teacher2_id'] = null;
  }

  if (isset($datas["district"]) && intval($datas["district"]) == 0) {
    unset($datas["district"]);
  }
  
  if (isset($classInfo["self_report"])) {
    $datas["self_report"] = $classInfo["self_report"] == "true" ? 1 : 0;
  }
  
  $id = intval($classInfo["id"]);
  if ($id == 0) {
    return $medoo->insert("classes", 
        array_merge($datas, ["country" => $classInfo["country"]]));
  }

  return $medoo->update("classes", $datas, ["id" => $id]);
}

function update_task($task) {
  global $medoo;
  
  $datas = [];
  $fields = ["department_id", "name", "max", "duration", "sub_tasks",
      "starting_half_term", "report_half_term", "zb_name", "zb_course_id"];
  foreach ($fields as $field) {
    $datas[$field] = $task[$field];
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
      $course_group_id ? ["group_id" => $course_group_id] : null));
}

function get_course_by_id($course_ids) {
  global $medoo;

  return keyed_by_id($medoo->select("courses", "*", ["id" => $course_ids]));
}

function lookup_course($name) {
  global $medoo;

  return keyed_by_id($medoo->select("courses", "*", ["name[~]" => $name]));
}

function get_user_by_id($id) {
  global $medoo;

  return get_single_record($medoo, "users", $id);
}

function get_user($email) {
  global $medoo;
    
  $result = $medoo->select("users", "*", ["email" => $email]);
  if (empty($result)) return null;
  
  $classes = get_classes(["id" => $result[0]["classId"]]);

  $user = new User($result[0]);
  $user->classInfo = $classes[$user->classId];
  
  return $user;
}

function get_users($email, $classId = null, $user_id = null, $sn = null) {
  global $medoo;

  $result = null;
  if ($classId) {
    $result = $medoo->select("users", "*", ["classId" => $classId]);
  } elseif ($email){
    $result = $medoo->select("users", "*", ["email" => $email]);
  } elseif ($user_id) {
    $result = $medoo->select("users", "*", ["id" => $user_id]);
  } elseif ($sn) {
    $result = $medoo->select("users", "*", ["internal_id" => $sn]);
  }

  if (empty($result)) {
    return [];
  }

  $classes = ($email || $user_id) ? 
      get_classes(["id" => $result[0]["classId"]]) : null;
  $users = array();

  foreach ($result as $index => $row) {
    $user = new User($row);
    $user->password = null;
    $user->classInfo = $classes ? $classes[$user->classId] : null;

    $users[$user->id] = $user;
  }

  return $users;
}

function remove_user($id) {
  global $medoo;

  $medoo->delete("class_prefs", ["user_id" => $id]);
  if ($medoo->delete("users", ["id" => $id])) return 1;

  $deletedClass = current($medoo->select("classes", ["id"],
      ["deleted" => 1, "LIMIT" => 1]));
  update_user(["id" => $id, "classId" => $deletedClass["id"]]);
  return 1;
}

function update_user($user) {
  global $medoo;

  $datas = [];  
  $fields = ["internal_id", "name", "nickname", "email",
      "phone", "street", "city", "country", "zip",
      "im", "occupation", "comments", "skills", "bio", "experience"];

  foreach ($user as $key => $value) {
    if ($key == "password") {
      $datas[$key] = md5($value);
    } elseif (in_array($key, User::$int_fields)) {
      if (is_numeric($value) || is_string($value) && strlen($value)) {
        $datas[$key] = intval($value);
      }
    } elseif (in_array($key, $fields)) {
      if ($key == "email" && is_email_blocked($value)) exit();
      $filter = 
          $key == "email" ? FILTER_SANITIZE_EMAIL : FILTER_SANITIZE_STRING; 
      $datas[$key] = filter_input(INPUT_POST, $key, $filter);
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

    $datas["permission"] = get_student_permission();
    if ($id = $medoo->insert("users", $datas)) {
      return current(get_users(null, null, intval($id)));
    }
  }

  return null;
}

/// Renames email of the user (identified by [$user_id]) to ['$newEmail'],
/// and registers a new user with the old (current) email.
function clone_user($user_id, $newEmail = null, $newClassId = null) {
  global $medoo;
  
  $user = get_single_record($medoo, "users", $user_id);
  if (!$user) return 0;

  $email = $newEmail ? $newEmail : ($user["email"]. ".deleted");
  if (!$medoo->update("users", ["email" => $email], ["id" => $user_id])) {
    return 0;
  }
  
  unset($user["id"]);
  unset($user["internal_id"]);
  unset($user["zb_id"]);
  if ($newClassId) {
    $user["classId"] = $newClassId;
  }
  $newId = $medoo->insert("users", $user);
  if (!$newId) {
    return 0;
  }

  if (!$newEmail) {
    remove_user($user_id);
  }

  $references = [
    "teacher_id" => "classes",
    "teacher2_id" => "classes",
    "teacher" => "schedules",
    "teacher_planned" => "schedules",
    "user" => "staff"
  ];

  foreach($references as $field => $table) {
    $medoo->update($table, [$field => $newId], [$field => $user_id]);
  }
  return $newId;
}

function get_db_error() {
  global $medoo;
  
  return get_db_error2($medoo);
}

function get_last_task_record($user_id, $task_id, $sub_index) {
  global $medoo;
  
  $sql = '';
  if ($sub_index == null) {
    $sql = sprintf("SELECT id, count, sub_index, UNIX_TIMESTAMP(ts) uts FROM 
        task_records WHERE student_id=%d AND task_id=%d ORDER BY id DESC 
        LIMIT 1;",
        intval($user_id), intval($task_id));
  } else {
    $sql = sprintf("SELECT id, count, sub_index, UNIX_TIMESTAMP(ts) uts FROM
        task_records WHERE student_id=%d AND task_id=%d AND sub_index=%d 
        ORDER BY id DESC LIMIT 1;",
        intval($user_id), intval($task_id), intval($sub_index));
  }

  $result = $medoo->query($sql)->fetchAll();
  
  if (empty($result)) return null;
  
  $record = current($result);

  $sql = sprintf("SELECT SUM(count), SUM(duration) FROM task_records
      WHERE student_id=%d AND task_id=%d AND sub_index=%d;",
      intval($user_id), intval($task_id), intval($record["sub_index"]));
  $sums = current($medoo->query($sql)->fetchAll());

  return [
      "count" => intval($record["count"]),
      "sub_index" => intval($record["sub_index"]),
      "ts" => $record["uts"],
      "sum" => $sums[0],
      "totalDuration" => $sums[1],
      "id" => intval($record["id"])
  ];
}

function get_tasks($department_id) {
  global $medoo;

  $int_fields = ["duration", "max", "sub_tasks", "starting_half_term",
      "report_half_term", "zb_course_id"];
  $where = ["OR" => 
      ["department_id" => $department_id, "dep2" => $department_id]];
  $tasks = keyed_by_id($medoo->select("tasks", "*",
      $department_id ? $where : null));
  foreach ($tasks as $id => $task) {
    $tasks[$id] = convert_int_fields($task, $int_fields);
  }
  return $tasks;
}

function convert_stat_result($result) {
  return ["sub_index" => intval($result["sub_index"]),
      "sum" => intval($result["sum"]),
      "duration" => intval($result["duration"])
  ];
}

function get_class_task_stats($classId, $task_id, $startTime, $endTime,
    $isIndex = FALSE) {

  global $medoo;

  $users = $medoo->select("users", ["id", "name", "zb_id"],
      ["classId" => $classId]);

  $timeFilter = "";
  if (!empty($startTime) && !empty($endTime)) {
    if ($isIndex) {
      $timeFilter = sprintf(" AND sub_index >= %d AND sub_index <= %d",
          intval($startTime - 1), intval($endTime - 1));
    } else {
      $timeFilter = sprintf(" AND ts BETWEEN FROM_UNIXTIME(%d) and " .
          "FROM_UNIXTIME(%d)", intval($startTime), intval($endTime));
    }
  }
  
  foreach ($users as $key => $user) {
    $sql = sprintf("select sub_index, SUM(count) as sum, SUM(duration)".
        " as duration from task_records where task_id=%d and ".
        " student_id=%d %s group by sub_index", intval($task_id), 
        intval($user["id"]),
        $timeFilter);

    $result = $medoo->query($sql)->fetchAll();
    
    $user["stats"] =
        keyed_by_id(array_map("convert_stat_result", $result), "sub_index");
    $users[$key] = $user;
  }
  
  return $users;
}

function get_guanxiu_task_stats($classId, $task_id, $indexes) {
  global $medoo;

  $users = $medoo->select("users", ["id", "name", "zb_id"],
      ["classId" => $classId]);

  foreach ($users as $key => $user) {
    $result = $medoo->select("task_records",
        ["sub_index", "count(sum)", "duration"],
        ["AND" => [
          "task_id" => $task_id,
          "student_id" => $user["id"],
          "sub_index" => $indexes
        ]]);
    $user["stats"] =
        keyed_by_id(array_map("convert_stat_result", $result), "sub_index");
    $users[$key] = $user;
  }
  
  return $users;
}

function report_task($user_id, $task_id, $sub_index, $count, $duration, $half_term) {
  global $medoo;

  if (empty($count)) return 0;

  $task = get_single_record($medoo, "tasks", $task_id);
  if (!$task || empty($task["duration"]) != empty($duration)) return 0;
  
  if (intval($task["sub_tasks"])) {
    $updated = $medoo->update("task_records", [
        "count[+]" => intval($count),
        "duration[+]" => $duration,
        "half_term" => $half_term
      ], 
      ["AND" => [
        "student_id" => intval($user_id),
        "task_id" => intval($task_id),
        "sub_index" => intval($sub_index)
      ], "LIMIT" => 1        
    ]);
    if ($updated) return $updated;
  }
  return $medoo->insert("task_records", [
    "student_id" => intval($user_id), 
    "task_id" => intval($task_id),
    "sub_index" => intval($sub_index),
    "count" => intval($count),
    "duration" => $duration,
    "half_term" => $half_term
  ]);
}

function convert_schedule_record($source, $string_to_int = false) {
  $target = [];
  foreach (["video", "text", "attended"] as $task) {
    if (isset($source[$task])) {
      if ($string_to_int) {
        $target[$task] = $source[$task] == "true" ? 1 : 0;
      } else {
        $target[$task] = $source[$task] == 1 ? true : false;
      }
    }
  }

  return $target;
}

/// Whether all fields in the array are all 0.
function is_empty_data($datas, $fields) {
  foreach ($fields as $field) {
    if (!empty($datas[$field])) return false;
  }

  return true;
}

function report_schedule_task($user_id, $schedule) {
  global $medoo;
  
  $course_id = intval($schedule["course_id"]);
  $datas = convert_schedule_record($schedule, true);
  $datas["half_term"] = $schedule["half_term"];

  $table = "schedule_records";

  $where = ["AND" => ["course_id" => $course_id, "student_id" => $user_id]];

  if (is_empty_data($datas, ["video", "text", "attended"])) {
    return $medoo->delete($table, $where);
  }

  $rows = $medoo->update($table, $datas, $where);
  if ($rows) return $rows;

  $datas["student_id"] = $user_id;
  $datas["course_id"] = $course_id;
  $medoo->insert($table, $datas);
  // schedule_records does not have AUTO_INC primary key, 
  // insert always returns 0.
  return 1;
}

/// Returns all schecule groups for [$classId].
function get_schedule_groups($classId) {
  global $medoo;

  return $medoo->select("schedule_groups", "*", ["classId" => $classId]); 
}

function get_schedules($classId, $term, $records, $user_id) {
  global $medoo;
  
  date_default_timezone_set("UTC");
  
  if (intval($term) == 0) {
    $term = $medoo->max("schedule_groups", "term", ["classId" => $classId]);
    if (!$term) return null;
  }

  $schedule_groups =
      keyed_by_id($medoo->select("schedule_groups", "*",
          ["AND" => ["classId" => $classId, "term" => $term]]));

  function getCourseIds($schedule) {
    return [intval($schedule["course_id"]), intval($schedule["course_id2"])];
  }

  function flatten($arrays) {
    $result = [];
    foreach ($arrays as $array) {
      $result = array_merge($result, $array);
    }
    return $result;
  }

  $allCourseIds = [];
  foreach ($schedule_groups as $group_id => $group) {
    $group["start_time"] = (new DateTime($group["start_time"]))->getTimestamp();
    if (!empty($group["end_time"])) {
      $group["end_time"] = (new DateTime($group["end_time"]))->getTimestamp();
    }
    $group["schedules"] = keyed_by_id($medoo->select("schedules", "*",
        ["group_id" => $group_id]));
    
    $group["limited_courses"] =
        keyed_by_id($medoo->select("courses", ["id", "name"],
            ["group_id" => $group["limited_course_group"]]));

    $courseIds = array_merge(
        flatten(array_map("getCourseIds", $group["schedules"])),
        array_keys($group["limited_courses"]));
    $allCourseIds = array_merge($allCourseIds, $courseIds);

    $group["courses"] = keyed_by_id(
      $medoo->select("courses", ["id", "name", "zb_name"], ["id" => $courseIds])
    );

    $group["term"] = intval($group["term"]);
    $group["mid_week"] = intval($group["mid_week"]);
    $schedule_groups[$group_id] = $group;
  }
  
  $users =
      keyed_by_id($medoo->select("users", ["id", "name", "zb_id"],
          ["classId" => $classId]));
  
  foreach ($users as $id => $user) {
    if ($records == 'none' || $records == 'mine' && $id != $user_id) continue;

    $records =
        keyed_by_id($medoo->select("schedule_records", "*",
            ["AND" => [
              "student_id" => $id,
              "course_id" => $allCourseIds,
              ]
            ]), "course_id");
      
    $user["records"] = array_map("convert_schedule_record", $records);
    $users[$id] = $user;
  }
      
  return ["groups" => $schedule_groups, "users" => $users ];
}

function update_schedule($schedule) {
  global $medoo;

  $datas = ["course_id" => NULL, "course_id2" => NULL];
  $int_fields = ["course_id", "course_id2", "group_id", "open", "review",
      "teacher_planned", "teacher"];
  foreach ($int_fields as $field) {
    if (isset($schedule[$field])) {
      $datas[$field] = intval($schedule[$field]);
    }
  }
  if (isset($schedule["notes"])) {
    $datas["notes"] = $schedule["notes"];
  }
  if (intval($datas["course_id"]) == 0) {
    $datas["course_id"] = NULL;
  }
  if (intval($datas["course_id2"]) == 0) {
    $datas["course_id2"] = NULL;
  }

  if (empty($schedule["id"])) {
    return $medoo->insert("schedules", $datas);
  }

  if (!empty($schedule["notified"])) {
    $datas["#notified"] = "NOW()";
  }
  return $medoo->update("schedules", $datas,
      ["id" => $schedule["id"]]);
}

function formatTimestamp($tm) {
  date_default_timezone_set("UTC");

  $dt = new DateTime();
  $dt->setTimestamp($tm);
  return $dt->format("Y-m-d H:i:s");
}

function update_schedule_group($group) {
  global $medoo;

  $datas = [];
  $fields = ["classId", "course_group", "course_group2", "term",
      "limited_course_group", "mid_week"];
  foreach ($fields as $field) {
    if (isset($group[$field])) {
      $value = intval($group[$field]);
      $datas[$field] = $value ? $value : null;
    }
  }
  
  if (!empty($group["start_time"])) {
    $datas["start_time"] = formatTimestamp(intval($group["start_time"]));
  }
  if (isset($group["end_time"])) {
    $datas["end_time"] = formatTimestamp(intval($group["end_time"]));
  }

  $id = $group["id"];

  if ($id == 0) {
    $id = $medoo->insert("schedule_groups", $datas);
    if (!$id) return false;
  } else {
    $medoo->update("schedule_groups", $datas, ["id" => $id]);
  }

  if (empty($group["schedules"])) return $id;
  $schedules = $group["schedules"];

  ksort($schedules);
  $medoo->delete("schedules", ["group_id" => $id]);
  foreach ($schedules as $schedule) {
    $schedule["group_id"] = $id;
    unset($schedule["id"]);
    update_schedule($schedule);
  }

  return $id;
}

function get_task_history($userId, $task_id) {
  global $medoo;
  
  return $medoo->select('task_records', '*', ["AND" => [
      "student_id" => $userId,
      "task_id" => $task_id
  ]]);
}

function get_task_record($task_id) {
  global $medoo;
  
  $result = $medoo->select('task_records', "*", ["id" => $task_id]);
  if (empty($result)) return null;
  
  return current($result);
}

function remove_task_record($task_id) {
  global $medoo;
  
  return $medoo->delete('task_records', ["id" => $task_id]);
}

function search($prefix) {
  global $medoo;
  
  $users = $medoo->select("users", ["classId", "name", "email", "country"],
      ["OR" => ["name[~]" => $prefix, "email[~]" => $prefix]]);
  return filter_deleted_users($medoo, $users);
}

/// A search returns only id, name and nick name.
function searchByName($name) {
  global $medoo;
  
  $users = $medoo->select("users",
      ["id", "name", "nickname", "country", "email", "classId"],
      ["OR" => ["name[~]" => $name, "nickname[~]" => $name,
          "email[~]" => $name], "LIMIT" => 30]);
  return filter_deleted_users($medoo, $users);
}

/// Returns "name(nickname)" for a user identified by [$id].
function getUserLabel($id) {
  global $medoo;
  return get_user_label($medoo, $id);
}

/// Returns the distribution of people in each state of the country.
///
/// Returns a map like ["1" => 32, "2" => 48, ..., "8" => 26];
function get_state_stats($countryCode) {
  global $medoo;

  if (!is_country_code($countryCode)) return [];

  $sql = sprintf("SELECT COUNT(id) as sum, state FROM users WHERE (country='%s') ".
      " AND (classId NOT IN (%s)) GROUP BY state",
      $countryCode, join(",", get_excluded_classes($medoo)));
  $result = $medoo->query($sql)->fetchAll();
  
  $states = [];
  foreach ($result as $record) {
    $states[$record["state"]] = $record["sum"];
  }
  return $states;
}

function get_state_users($countryCode, $stateIndex) {
  global $medoo;
  
  return $medoo->select("users", "*",
      ["AND" => [
          "country" => $countryCode, 
          "state" => $stateIndex,
          "classId[!]" => get_excluded_classes($medoo)
      ]]);
}

function is_teacher($id) {
  global $medoo;
  
  return $medoo->count("classes", "id", ["OR" => [
      "teacher_id" => $id,
      "teacher2_id" => $id
  ]]) > 0;
}

function attendanceStats($user_id, $classId) {
  global $medoo;

  $groupIds = $medoo->select("schedule_groups", "id",
      ["AND" => ["classId" => $classId, "term[!]" => null]]); 
  $courseIds = $medoo->select("schedules", "course_id",
      ["AND" => ["group_id" => $groupIds, "course_id[!]" => null]]);
  $attended = $medoo->select("schedule_records", "course_id",
      ["AND" => ["student_id" => $user_id, "attended" => 1]]);
  return ["total" => count($courseIds), 
      "attended" => count(array_intersect($courseIds, $attended))];
}

/// Whether [$user] can report task for [$task_user_id].
function canWriteUser($user, $targetUser) {
  if ($user == $targetUser || $user->id == $targetUser) return true;

  if (!($targetUser instanceof User)) {
    $targetUser = get_users(null, null, $targetUser)[$targetUser];
    if (!$targetUser) return false;
  }
  return $user->id == $targetUser->id ||
      canWrite($user, $targetUser->classInfo);
}
?>
