<?php
include_once 'user.php';

function get_classes($medoo) {
	$result = $medoo->select('classes', '*');
	$length = sizeof($result);

	$classes = array();
	foreach ($result as $clazz) {
		$info = new ClassInfo();
		$info->id = $clazz['id'];
		$info->name = $clazz['class_name'];
		$info->teacherId = $clazz['teacherId'];
	
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
		$action_type->value_type = $row['value_type'];

		$types[$row['id']] = $action_type;
	}
	
	return $types;
}
?>
