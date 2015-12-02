<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="../style.css"></link>
<title>Upload table data</title>
</head>

<body>

<?php
include_once "datatype.php";
include_once "connection.php";
include_once "tables.php";

$conn = get_medoo ();

function parseHead($str) {
	// 人数61,序号,姓名,性别,联系电话,电子邮箱或QQ号,居住省份/直辖市,市/县/区,选择共修时间,,,,,
	$fields = explode(",", $str);
	$head = [];
	$head[0] = array_search('序号', $fields);
	$head[1] = array_search('姓名', $fields);
	$head[2] = array_search('性别', $fields);
	$head[3] = array_search('联系电话', $fields);
	$head[4] = array_search('电子邮箱或QQ号', $fields);
	$head[5] = array_search('居住省份/直辖市', $fields);
	$head[6] = array_search('市/县/区', $fields);
	$head[7] = array_search('选择共修时间', $fields);
	
	return $head;
}

function parseUser($user, $head, $str) {
	echo "Parsing " . $str . "<BR>";
	$fields = explode ( ",", $str );
	
	$user->internalId = $fields [$head[0]];
	$user->name = $fields [$head[1]];
	$user->sex = ($fields [$head[2]] == "男");
	$user->phone = $fields [$head[3]];
	$user->email = $fields [$head[4]];
	
	$tm = $fields [$head[7]];
	if ($tm == '周日早上') {
		$user->classId = (2 << 16) | 2;
	} elseif ($tm == '周四晚上') {
		$user->classId = (2 << 16) | 1;
	} elseif ($tm == '周一6:30') {
		$user->classId = (4 << 16) | 1;
	} elseif ($tm == '周二晚') {
		$user->classId = (3 << 16) | 1;
	} elseif ($tm == '周四晚') {
		$user->classId = (3 << 16) | 2;
	} elseif ($tm == '周六下午') {
		$user->classId = (3 << 16) | 3;
	}
	
	$user->permission = 1;
	
	return !empty($user->name);
}

function create_users($conn, $filename, $classId) {
	$user = new User (null);
	$user->classId = $classId;
	$user->permission = 1;
	
	$handle = fopen ( $filename, "r" );
	
	if (! $handle) {
		echo "Failed to read uploaded file ", $filename;
		return;
	}
	
	// Skip the header.
	$head = parseHead(fgets ( $handle ));
	
	while ( ($line = fgets ( $handle )) !== false ) {
		if (parseUser ( $user, $head, $line ) && $conn->insert("users", $user->toArray())) {
			echo "Created student record for " . $user->name . "<BR>";
		}
		;
	}
	
	fclose ( $handle );
}

if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["submit"] )) {
	$classId = $_POST ["classId"];
	
	create_users ( $conn, $_FILES ["users"] ["tmp_name"], intval ( $classId ) );
} else {
	?>
    <div class="center padded-element">
		<form method="POST" enctype="multipart/form-data">
			<div class="padded-element">
				<div>Select user record (*.csv) to upload:</div>
				<input type="file" name="users" id="users">
			</div>

			<span class="padded-element">Select class:</span> <select
				name="classId">
<?php
	$classes = get_classes(null);
    foreach ($classes as $clazz) {
?>
		<option value="<?=$clazz->id?>"><?=$clazz->name?></option>
<?php
	}
?>
        </select>
			<div class="padded-element">
				<div>
					<input type="submit" name="submit">
				</div>
			</div>
		</form>
	</div>

<?php
}

?>
</body>
</html>
