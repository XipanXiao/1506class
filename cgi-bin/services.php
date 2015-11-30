<?php
include_once 'tables.php';

if (empty($_SESSION)) {
	session_start ();
}

if (!isset($_SESSION["user"])) {
	echo '{"error": "login needed"}';
	exit();
}

$user = unserialize($_SESSION["user"]); 
$student_id = $user->id;
$response = null;

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
	$resource_id = $_GET["rid"];
	$class_id = empty($_GET["class_id"]) ? $user->classId : $_GET["class_id"];

	if ($resource_id == "classes") {
		if (empty($_GET["class_id"])) {
			$response = get_classes(null);
		} else {
			$response = get_classes($class_id);
		}
	} else if ($resource_id == "tasks") {
		if (isset($_GET["task_id"]) && isset($_GET["pos"])) {
			$task_id = $_GET["task_id"];
			$pos = $_GET["pos"];
			
			if ($pos == "last") {
				$last_record = get_last_task_record($student_id, $task_id);
				$last_record["sum"] = task_sum($student_id, $task_id);

				$response = $last_record;
			} else if ($pos == "sum") {
				$response = ["sum" => task_sum($student_id, $task_id)];
			}
		} else {
			$response = get_tasks($user->classId);
		}
	} elseif ($resource_id == "schedules") {
		$response = $medoo->select("schedules", "*", ["class_id" => $class_id]);
	} elseif ($resource_id == "courses") {
		$response = get_courses($class_id);
	} elseif ($resource_id == "users") {
		$email = empty($_GET["email"]) ? null : $_GET["email"];
		if (!$email || $email == $user->email) {
			$response = $user;
		} else {
			$response = get_users($email);
		}
	}
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
	$resource_id = $_POST["rid"];

	if ($resource_id == "tasks") {
		$task_id = $_POST["task_id"];
		$count = $_POST["count"];
		report_task($student_id, $task_id, $count);
		$response = ["sum" => task_sum($student_id, $task_id)];
	}
}

if ($response) {
	echo json_encode($response);
}
?>
