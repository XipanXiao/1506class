<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="../style.css"></link>
<title>学修记录</title>
</head>

<body>

<?php
include_once "connection.php";
include_once "tables.php";

if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["submit"] )) {
	foreach ($action_types as $id => $action_type) {
		if (!isset($_POST[$id])) {
			continue;
		}
		
		$data = [
				'student_id' => $_SESSION["userid"],
				'class_id' => $_SESSION["classId"],
				'action_type' => $id, 
				'action_count' => $_POST[$id]
		];
		
		$medoo->insert('learning_records', $data);
	}
} else {
include_once "app_bar.php";

$schedules = $medoo->select("schedules", "*", ["class_id" => $user->classId]);
$courses = get_courses();
?>

<div class="css-table center">
		<div class="css-table-row">
			<div class="css-table-cell">周数</div>
			<div class="css-table-cell">时间</div>
			<div class="css-table-cell">上课内容</div>
			<div class="css-table-cell">是否出席</div>
			<div class="css-table-cell">听传承</div>
			<div class="css-table-cell">读法本</div>
			<div class="css-table-cell">观修</div>
		</div>
<?php
	$week = 0;
	foreach ($schedules as $schedule) {
		
		$course_id = $schedule["course_id"];
		$course_name =  $course_id == 0 ? "放假" : $courses[$course_id];
?>
		<div class="css-table-row">
			<div class="css-table-cell"><?=++$week?></div>
			<div class="css-table-cell"><?=$schedule["dt"]?></div>
			<div class="css-table-cell"><?=$course_name?></div>
			<div class="css-table-cell"><input type="checkbox"></div>
			<div class="css-table-cell"><input type="checkbox"></div>
			<div class="css-table-cell"><input type="checkbox"></div>
			<div class="css-table-cell"><input type="checkbox"></div>
		</div>
<?php 
	}
?>
</div>
<?php
}
?>

</div>

</body>

</html>
