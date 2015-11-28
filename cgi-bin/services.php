<?php
include_once 'tables.php';

if (empty($_SESSION)) {
	session_start ();
}

$user = unserialize($_SESSION["user"]); 
$student_id = $user->id;

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
	$resource_id = $_GET["rid"];
	if ($resource_id == "classes") {
		echo json_encode(get_classes()); 
	} else if ($resource_id == "tasks") {
		if (isset($_GET["task_id"]) && isset($_GET["pos"])) {
			$task_id = $_GET["task_id"];
			$pos = $_GET["pos"];
			
			if ($pos == "last") {
				$last_record = get_last_task_record($student_id, $task_id);
				$last_record["total"] = task_sum($student_id, $task_id);

				echo json_encode($last_record);
			} else if ($pos == "sum") {
				echo json_encode(task_sum($student_id, $task_id));
			}
		} else {
			$classes = get_classes();
			$groupId = $classes[$user->classId]->groupId;
			echo json_encode(get_tasks($groupId));
		}
	}
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
	$resource_id = $_POST["rid"];

	if ($resource_id == "tasks") {
		$task_id = $_POST["task_id"];
		$count = $_POST["count"];
		report_task($student_id, $task_id, $count);
		echo sprintf("{\"total\": %d}", task_sum($student_id, $task_id));
	}
}
?>
