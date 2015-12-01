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

function parseUser($user, $str) {
	echo "Parsing " . $str . "<BR>";
	$fields = explode ( ",", $str );
	
	$length = sizeof ( $fields );
	
	if ($length < 8) {
		echo "Length is " . $length . "<BR>";
		return false;
	}
	
	$user->internalId = $fields [2];
	$user->name = $fields [3];
	$user->sex = ($fields [4] == "男");
	$user->phone = $fields [5];
	$user->email = $fields [6];
	$user->address = $fields [9];
	
	if ($length > 11) {
		//$user->mentor = $fields [11];
	}
	
	$user->permission = $length > 13 ? $fields [13] : 1;
	if (! $user->permission || $user->permission == 0) {
		$user->permission = 1;
	}
	
	return true;
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
	fgets ( $handle );
	
	while ( ($line = fgets ( $handle )) !== false ) {
		if (parseUser ( $user, $line ) && $conn->insert("users", $user->toArray())) {
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
