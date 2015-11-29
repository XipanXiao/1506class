<?php
include_once "connection.php";
include_once "tables.php";

?>
<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="../style.css"></link>
<title>学修记录</title>
</head>

<body class="wide-body">

<?php
include_once "connection.php";
include_once "tables.php";
include_once "app_bar.php";

$schedules = $medoo->select("schedules", "*", ["class_id" => $user->classId]);
$group_id = $classes[$user->classId]->groupId;
$tasks = $medoo->select("group_tasks", ["id", "task_name"], ["group_id" => $group_id]);
$courses = get_courses();

?>
<tasks class="left" ng-controller="TasksController"></tasks>

<div class="css-table right odd-even">
		<div class="css-table-row header">
			<div class="css-table-cell"><strong>周数</strong></div>
			<div class="css-table-cell"><strong>时间</strong></div>
			<div class="css-table-cell"><strong>上课内容</strong></div>
			<div class="css-table-cell"><strong>出席</strong></div>
			<div class="css-table-cell"><strong>听传承</strong></div>
			<div class="css-table-cell"><strong>读法本</strong></div>
			<div class="css-table-cell"><strong>念诵</strong></div>
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

<script type="text/javascript" src="../js/angular.js"></script>
<script data-main="../js/homework_app.js" src="../js/require.js"></script>

</body>

</html>
