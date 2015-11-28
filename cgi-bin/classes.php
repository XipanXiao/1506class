<div class="left class-list">
<?php
	include_once 'connection.php';
	include_once 'tables.php';
	
	$classes = get_classes();
	
	foreach ($classes as $classInfo) {
?>
		<div>
			<a href="schedule.php?class_id=<?=$classInfo->id?>"><?=$classInfo->name?></a>
		</div>
<?php		
	}
?>
</div>
