<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="../style.css"></link>
<title>课程时间安排</title>
</head>
<body>
<?php
	include_once "connection.php";
	include_once "tables.php";
	include_once "app_bar.php";
	include_once "classes.php";
?>
<div class="css-table padded-element">
<?php	
	$class_id = 0;
	if (!empty($_GET['class_id'])) {
		$class_id = $_GET['class_id'];
	} else {
		$class_id = $_SESSION['user']->classId;
	}
	
	$medoo = get_medoo();
	$courses = get_courses($medoo); 

	foreach ($courses as $course) {
?>
			<div class="css-table-row">
				<div class="css-table-cell"><?=$course?></div>
			</div>
<?php
	}
?>
</div>	
</body>
</html>
