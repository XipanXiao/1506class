<?php
include_once "connection.php";
include_once "tables.php";

if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["task_id"] )) {
	$student_id = $_POST["student_id"];
	$task_id = $_POST["task_id"];
	report_task($student_id, $task_id, $_POST["count"]);
	
	echo "{'total':". task_sum($student_id, $task_id) ."}";	
	exit();
}
?>
<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="../style.css"></link>
<title>学修记录</title>
<script type="text/javascript" src="../js/jquery-1.11.3.js">
</script>
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
<div class="left">
<?php
	foreach ($tasks as $task) {
		$task_id = $task["id"];
		$input_id = "count_". $task_id;
?>
		<div>
			<div class="task_name"><?=$task['task_name']?></div>
<?php
			$total = task_sum($user->id, $task_id);
			$last_record = get_last_task_record($user->id, $task_id);
			if (empty($total)) {
?>
				<div class="padded-element no-record">暂时没有学修记录。</div>	
<?php
			} else {
?>
				<div>累计报数：<?=$total?></div>
				<div>上次报数：<?=$last_record["count"]?></div>
				<div>（<?=$last_record["ts"]?>）</div>
<?php
			}
?>
			<div class="padded-element">
				<input class="count-input" type="number" name="count" id="<?=$input_id?>" required>
				<input type="button" value="report" task-id="<?=$task_id?>">
			</div>			
		</div>
<?php
	}
?>
</div>
<div class="css-table right odd-even">
		<div class="css-table-row header">
			<div class="css-table-cell"><strong>周数</strong></div>
			<div class="css-table-cell"><strong>时间</strong></div>
			<div class="css-table-cell"><strong>上课内容</strong></div>
			<div class="css-table-cell"><strong>出席</strong></div>
			<div class="css-table-cell"><strong>听传承</strong></div>
			<div class="css-table-cell"><strong>读法本</strong></div>
			<div class="css-table-cell"><strong>观修</strong></div>
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

</div>

<script type="text/javascript">
	$( "[task-id]" ).click(function(event) {
	  var task_id = event.target.getAttribute("task-id");
	  
	  var count = $("#count_" + task_id).val();
	  var student_id = <?=$user->id?>;
	  jQuery.post("", {"student_id": student_id, "task_id": task_id, "count": count},
		function(response, status) {
			if (response.error) {
			} else {
			}
		}, "json");
	});
</script>

</body>

</html>
