<?php
include_once 'datatype.php';

function get_classes($medoo) {
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

function get_courses($medoo) {
	$result = $medoo->select('courses', '*');
	$length = sizeof($result);

	$courses = array();
	foreach ($result as $row) {
		$courses[$row['id']] = $row['course_name'];
	}
	
	return $courses;
}

function get_action_types($medoo) {
	$result = $medoo->select('action_types', '*');
	$length = sizeof($result);

	$types = array();
	foreach ($result as $row) {
		$action_type = new ActionType();
		$action_type->name = $row['action_type'];
		echo $action_type->name . "<BR>";
		$action_type->value_type = $row['value_type'];

		$types[$row['id']] = $action_type;
	}
	
	return $types;
}

function get_user($medoo, $email) {
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
