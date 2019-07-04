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

  $groupIds =  $medoo->select("schedule_groups", "id", ["classId" => $classId]);
  $schedules = $medoo->select("schedules", "*", ["group_id" => $groupIds]);

  $schedules_records = $medoo->select("schedule_records", "*",
      ["student_id" => $student_ids]);
  // $schedules_records = $medoo->query("SELECT * FROM schedule_records WHERE student_id=76 and half_term=16;")->fetchAll();

  $tasks = $medoo->select("tasks", ["id", "zb_name"]);
  // Returns the raw data and let the client to handle,
  // since dart is preferrable.
  return [
    "records" => $records,
    "schedules" => $schedules,
    "schedules_records" => $schedules_records,
    "tasks" => $tasks,
    "users" => $users,
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
