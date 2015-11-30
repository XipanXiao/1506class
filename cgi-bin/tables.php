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

function get_class_group_id($class_id) {
	global $medoo;

	$result = $medoo->select('classes', ['group_id'], ['id' => $class_id, 'LIMIT' => 1]);
	return empty($result) ? 0 : current($result)['group_id'];
}

function get_class_courses($class_group_id) {
	global $medoo;

	$sql = sprintf("SELECT * FROM courses, class_courses WHERE
		courses.group_id = class_courses.course_group_id AND
		class_courses.class_group_id = %d;", $class_group_id);

	$courses = $medoo->query($sql)->fetchAll();

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

	$users = array();
	foreach ($result as $row) {
		$user = new User($row);
		$users[$user->email] = $user;
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
?>
