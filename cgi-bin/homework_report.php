<?php
include_once "connection.php";
include_once "const_tables.php";

$conn = get_medoo();

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
		
		$conn->insert('learning_records', $data);
	}
}

$classes = get_classes($conn);
$courses = get_courses($conn);
$action_types = get_action_types($conn);

$records = $conn->select("learning_records", "*", ["student_id" => $_SESSION['userid']]);
?>

<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="../style.css"></link>
<title>学修记录</title>
</head>

<body>
<div class="center result">
<?php
if (sizeof($records) > 0) {
?>
<table>
<tr><td>Class</td><td>Type</td><td>Sub Type</td><td>Count</td></tr>
<?php 
	foreach ($records as $record) {
?>
		<tr>
			<td><?=$classes[$record['class_id']]?></td>
			<td><?=$action_types[$record['action_type']]?></td>
			<td><?=$record['action_sub_type']?></td>
			<td><?=$record['action_count']?></td>
		</tr>
<?php 
	}
?>
</table>
<?php
}
?>

</div>

<div class="center report">
	<form action="POST">
		<div>
<?php
			foreach ($action_types as $id => $action_type) {
?>
				<div>
					<label for="<?=$id?>">
						<?=$action_type->name?>:
<?php
							// boolean type.
							if ($action_type->value_type == 1) {
?> 
								<input type="checkbox" name="<?=$id?>">
<?php
							} else {
?>
								<input type="number" name="<?=$id?>">
<?php
							}
?>					</label>
				</div>
<?php
			}
?>
			<div>
				<input type="submit" name="submit">
			</div>
		</div>
	</form>
</div>

</body>

</html>