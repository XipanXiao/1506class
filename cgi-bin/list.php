<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
<link rel="stylesheet" type="text/css" href="../style.css"></link>
</head>
<body>

	<div class="center">
		<table>
			<tr>
				<td>Name</td>
				<td>Gender</td>
				<td>Email</td>
				<td>Class</td>
			</tr>
<?php
include_once 'connection.php';
include_once 'tables.php';
function list_students($medoo) {
	
	$users = get_users(null);

// 	foreach ($users as $user) {
// 		echo sprintf("INSERT INTO users(internal_id, name, password, sex, nickname, email, phone, address, 
// 				yy, qq, wechat, class_id, mentor_id, response, permission) VALUES ('%s', '%s', '%s', %d, '%s', '%s', '%s', 
// 				'%s', '%s', '%s', '%s', %d, %d, '%s', %d);<BR>", $user->internalId, $user->name, $user->password, 
// 				$user->sex, $user->nickname, $user->email, $user->phone, $user->address,
// 				$user->yy, $user->qq, $user->wechat, $user->classId, 0, $user->response, $user->permission);
// 	}
	
	if (!empty($users)) {
		foreach ($users as $user) {
?>
			<tr>
				<td><?=$user->name?></td>
				<td><?=$user->sex?></td>
				<td><?=$user->email?></td>
				<td><?=$user->classId?></td>
			</tr>
<?php
		}
	}
}

$medoo = get_medoo();
list_students ( $medoo );
?>

		</table>
	</div>
</body>
</html>