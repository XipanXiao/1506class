<?php
include_once 'datatype.php';
include_once 'connection.php';

$medoo = get_medoo();

function get_classes($class_id) {
	global $medoo;
	
	$classes = array();
	$result = $medoo->select('classes', '*', $class_id ? ["id" => $class_id] : null);

	foreach ($result as $clazz) {
		$info = new ClassInfo();
		$info->id = $clazz['id'];
		$info->name = $clazz['name'];
		$info->teacherId = $clazz['teacher_id'];
		$info->startDate = $clazz['start_date'];
		$info->endDate = $clazz['end_date'];
		
		$classes[$info->id] = $info;
	}
	
	return $classes;
}

function get_courses($class_id) {
	global $medoo;

	$sql = sprintf("SELECT * FROM courses where (course_group_id >> 16) = %d", $class_id >> 16);
	$result = $medoo->query($sql)->fetchAll();
	
	if (empty($result)) {
		return $result;
	}
	
	$courses = array();
	foreach ($result as $course) {
		$courses[$course["id"]] = $course;
	}
	
	return $courses;
}

function get_users($email) {
	global $medoo;

	$result = null;
	if (empty($email)) {
		$result = $medoo->select("users", "*");
	} else {
		$result = $medoo->select('users', '*', ["email" => $email]);
	}

	$classes = get_classes();
	$users = array();
	
	foreach ($result as $index => $row) {
		$user = new User($row);
		$user->className = $classes[$user->classId]->name;

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
	
	$sql = sprintf("SELECT sum(count) FROM task_records WHERE student_id=%d AND task_id=%d;",
		$user_id, $task_id);
	$sum = current(current($medoo->query($sql)->fetchAll()));
	return $sum == null ? 0 : $sum;
}

function get_tasks($class_id) {
	global $medoo;

 	$sql = sprintf("SELECT * FROM tasks WHERE (id >> 16) = %d;", $class_id >> 16);
 	return $medoo->query($sql)->fetchAll();
}

function report_task($user_id, $task_id, $count) {
	global $medoo;
	
	$medoo->insert("task_records", [
		"student_id" => $user_id, 
		"task_id" => $task_id, 
		"count" => $count]);
}

function report_schedule_task($user_id, $schedule_id, $task_name) {
	global $medoo;
	
	$medoo->insert("schedule_records", [
			"student_id" => $user_id,
			"schedule_id" => $schedule_id,
			$task_name => $count]);
}

function get_schedule_records($user_id) {
	global $medoo;

	$records = $medoo->select("schedule_records", "*", ["student_id" => $user_id]);
	
	$result = array();
	foreach ($records as $record) {
		$result[$record["schedule_id"]] = $record;
	}
	
	return $result;
}


function get_schedules($user, $with_records) {
	global $medoo;

	$result = $medoo->select("schedules", "*", ["class_id" => $user->classId]);
	$courses = get_courses($user->classId);
	
	$schedules = array();
	foreach ($result as $schedule) {
		$course_id = $schedule["course_id"];
		$schedule["course_name"] = $course_id == 0 ? "放假" : $courses[$course_id]["course_name"];
	
		$schedules[$schedule["id"]] = $schedule;
	}

	if ($with_records) {
		$records = get_schedule_records($user->id);

		foreach ($records as $record) {
			$schedules[$record["schedule_id"]]["record"] = $record;
		}
	}

	return $schedules;
}
?>
