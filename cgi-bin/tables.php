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
?>
