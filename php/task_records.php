<?php
/// v2 task records module
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";

$medoo = get_medoo();

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
}

function get_last_term($classId) {
  global $medoo;

  $term = $medoo->max("schedule_groups", "term", ["classId" => $classId]);
  return ["half_term" => intval($term) * 2];
}

function get_task_data_stats($classId) {
  global $medoo;

  $users = keyed_by_id($medoo->select("users", ["id", "name", "zb_id"],
    ["classId" => $classId]));
  $student_ids = array_keys($users);

  $sql = sprintf("SELECT half_term, student_id, task_id, sub_index,
      SUM(count) as count, SUM(duration) as duration
      FROM task_records
      WHERE student_id in (%s)
      GROUP BY half_term, student_id, task_id, sub_index;",
      join(",", $student_ids));
  $records = $medoo->query($sql)->fetchAll();

  $tasks = keyed_by_id($medoo->select("tasks", ["id", "zb_name"]));
  // Returns the raw data and let the client to handle,
  // since dart is preferrable.
  return [
    "records" => $records,
    "tasks" => $tasks,
    "users" => $users,
  ];
}

function get_schedule_records($classId) {
  global $medoo;

  $users = keyed_by_id($medoo->select("users", ["id", "name", "zb_id"],
      ["classId" => $classId]));
  $student_ids = array_keys($users);

  $records = $medoo->select("schedule_records", "*", ["student_id" => $student_ids]);
  return [
    "users" => array_map(function($user) {
      return [
        "id" => intval($user["id"]),
        "name" => $user["name"], 
        "userID" => $user["zb_id"]
      ];
    }, $users),
    "records" => $records
  ];
}

function get_schedules($classId) {
  global $medoo;

  $groupIds = $medoo->select("schedule_groups", "id", ["classId" => $classId]);
  return $medoo->select("schedules", "*", ["group_id" => $groupIds]);
}

function get_guanxiu_task_stats($classId, $indexes) {
  global $medoo;

  $users = keyed_by_id($medoo->select("users", ["id", "name", "zb_id"],
      ["classId" => $classId]));
  $student_ids = array_keys($users);

  $sql = sprintf("SELECT student_id, sub_index,
      SUM(count) as count, SUM(duration) as duration
      FROM task_records
      WHERE task_id=4 AND student_id in (%s)
      GROUP BY student_id, sub_index;",
      join(",", $student_ids));
  $records = $medoo->query($sql)->fetchAll();
  
  return [
    "users" => array_map(function($user) {
      return [
        "id" => intval($user["id"]),
        "name" => $user["name"], 
        "userID" => $user["zb_id"]
      ];
    }, $users),
    "records" => $records
  ];
}

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset($_GET["rid"])) {
  $classId = $_GET["classId"];
  $recourse_id = $_GET["rid"];

  if ($recourse_id == "half_term") {
    $response = get_last_term($classId);
  } elseif ($recourse_id == "task_records") {
    $classInfo = get_single_record($medoo, "classes", $classId);
  
    $response = canRead($user, $classInfo)
      ? get_task_data_stats($classId)
      : permission_denied_error();
  } elseif ($recourse_id == "schedule_records") {
    $classInfo = get_single_record($medoo, "classes", $classId);
  
    $response = canRead($user, $classInfo)
      ? get_schedule_records($classId)
      : permission_denied_error();
  } elseif ($recourse_id == "schedules") {
    $response = get_schedules($classId);
  } elseif ($recourse_id == "guanxiu") {
    $response = get_guanxiu_task_stats($classId, $_GET["task_indexes"]);
  }
}

if (is_array($response) && empty($response)) {
  echo '[]';
  return;
}

if ($response) {
  if (is_array($response) && isset($response["updated"]) &&
      intval($response["updated"]) == 0) {
        $response["error"] = get_db_error2($medoo);
      }

  echo json_encode($response);
}
?>
