<?php
include_once 'datatype.php';
include_once 'connection.php';

$medoo = get_medoo();

function get_classes() {
	global $medoo;
	
	$classes = array();
	$result = $medoo->select('classes', '*');

	foreach ($result as $clazz) {
		$info = new ClassInfo();
		$info->id = $clazz['id'];
		$info->groupId = $clazz['group_id'];
		$info->name = $clazz['class_name'];
		$info->teacherId = $clazz['teacher_id'];
		$info->startDate = $clazz['start_date'];
		
		$classes[$info->id] = $info;
	}
	
	return $classes;
}

function get_courses() {
	global $medoo;

	$result = $medoo->select('courses', '*');
	$length = sizeof($result);

	$courses = array();
	foreach ($result as $row) {
		$courses[$row['id']] = $row['course_name'];
	}
	
	return $courses;
}

function get_user($email) {
	global $medoo;

	$where = $email == null ? null : ['email' => $email];
	$result = $medoo->select('users', '*', $where);
	
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
	return current(current($medoo->query($sql)->fetchAll()));
}

function get_tasks($group_id) {
	global $medoo;
	return $medoo->select("group_tasks", ["id", "task_name"], ["group_id" => $group_id]);
}

function report_task($user_id, $task_id, $count) {
	global $medoo;
	
	$medoo->insert("task_records", [
		"student_id" => $user_id, 
		"task_id" => $task_id, 
		"count" => $count]);
}
?>
