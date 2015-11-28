<?php
include_once "connection.php";
include_once "tables.php";

if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["task_id"] )) {
	$student_id = $_POST["student_id"];
	$task_id = $_POST["task_id"];
	report_task($student_id, $task_id, $_POST["count"]);
	echo sprintf("{\"total\": %d}", task_sum($student_id, $task_id));
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

<body class="wide-body" ng-app="AppModule">

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
<tasks ng-controller="TasksController"></tasks>
<?php
	foreach ($tasks as $task) {
		$task_id = $task["id"];
		$input_id = "count_". $task_id;
?>
		<div class="padded-element">
			<div class="task_name"><?=$task['task_name']?></div>
<?php
			$total = task_sum($user->id, $task_id);
			$last_record = get_last_task_record($user->id, $task_id);
			if (empty($last_record)) {
				$last_record = array("count" => 0, "ts" => "");
			}
?>			
			<div class="no-record <?=$total ? 'hidden' : ''?>">暂时没有学修记录。</div>
			<div class="record <?=$total ? '' : 'hidden'?>">	
				<div>累计报数：<span class="total"><?=$total?></span></div>
				<div>上次报数：<span class="last"><?=$last_record["count"]?></span></div>
				<div class="ts">（<?=$last_record["ts"]?>）</div>
			</div>

			<input class="count-input" type="number" name="count" id="<?=$input_id?>" required>
			<input type="button" value="报数" task-id="<?=$task_id?>">
			<div class="hidden error"></div>
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

</div>

<script type="text/javascript">
	$( "[task-id]" ).click(function(event) {
		var button = $(event.target);
	  	var task_id = button.attr("task-id");
	  	var count = button.siblings("input[type='number']").val();

	  var student_id = <?=$user->id?>;
	  $.ajax({type: "POST", url: "", dataType: "json",
			  data: {"student_id": student_id, "task_id": task_id, "count": count},
			  success: function(response, status) {
				if (response.error) {
					button.siblings(".error").text(response.error).removeClass("hidden");
				} else {
					button.siblings(".no-record").addClass("hidden");

					var record = button.siblings(".record");
					record.removeClass("hidden");
					record.find(".total").text(response.total);
					record.find(".last").text(count);
					record.find(".ts").text("（刚才）");
				}
			 },
			 error: function(jqXHR, status, errorThrown) {
				button.siblings(".error").text(errorThrown).removeClass("hidden");
			 }});
	});
</script>

<script type="text/javascript" src="../js/angular.js"></script>
<script type="text/javascript" src="../js/services.js"></script>
<script type="text/javascript" src="../js/tasks/tasks.js"></script>
<script type="text/javascript" src="../js/app/app.js"></script>

</body>

</html>
