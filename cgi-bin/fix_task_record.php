<?php
include_once "config.php";
include_once "connection.php";
include_once "tables.php";
include_once "util.php";
include_once 'permission.php';

if (empty($_SESSION["user"])) {
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
  if (!isSysAdmin($user)) exit();

  $results = $medoo->select("tasks", ["id"]);
  
  $task_ids = [];
  foreach ($results as $result) {
  	array_push($task_ids, intval($result["id"]));
  }

  $results = $medoo->select("task_records", ["student_id"]);
  $student_ids = [];
  foreach ($results as $result) {
  	array_push($student_ids, intval($result["student_id"]));
  }
  $student_ids = array_unique($student_ids);
  
  foreach ($student_ids as $user_id) {
  	foreach ($task_ids as $task_id) {
  		$record = get_last_task_record($user_id, $task_id);
  		$record_sum = $record ? $record["sum"] : 0;
  		$sum = $medoo->sum("task_records", ["count"], 
  				["AND" => ["student_id" => $user_id, "task_id" => $task_id]]);
  		
  		if ($sum == 0 && $record_sum == 0) continue;

  		if ($record_sum != $sum) {
  			echo "===invalid records for student:". $user_id . " task:" . $task_id. 
  			    "recorded sum:" . $record_sum . " vs real sum:" . $sum . "<br>";
  		} else {
//   			echo "verified for student:". $user_id . " task:" . $task_id. 
//   			    "recorded sum:" . $record_sum . " vs real sum:" . $sum . "<br>";
  		}
  	}
  }
}
