<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="../style.css"></link>
<title>Upload table data</title>
</head>

<body>

<?php
include "user.php";
include "connection.php";

$conn = get_connection ();
function prepare_statement($conn, $user) {
	$sql = "INSERT INTO users(internalId, name, sex, nickname, email," . "phone, address, yy, qq, wechat, classId, mentor, response, permission," . "notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
	
	if (! ($stmt = $conn->prepare ( $sql ))) {
		echo "Prepare failed: (" . $conn->errno . ") " . $conn->error;
		return $stmt;
	}
	
	$stmt->bind_param ( "ssisssssssissis", $user->id, $user->name, $user->sex, $user->nickname, $user->email, $user->phone, $user->address, $user->yy, $user->qq, $user->wechat, $user->classId, $user->mentor, $user->response, $user->permission, $user->notes );
	return $stmt;
}
function parseUser($user, $str) {
	echo "Parsing " . $str . "<BR>";
	$fields = explode ( ",", $str );
	
	$length = sizeof ( $fields );
	
	if ($length < 8) {
		echo "Length is " . $length . "<BR>";
		return false;
	}
	
	$user->id = $fields [1];
	$user->name = $fields [2];
	$user->sex = ($fields [3] == "男");
	$user->phone = $fields [4];
	$user->email = $fields [5];
	$user->address = $fields [8];
	
	if ($length > 11) {
		$user->mentor = $fields [11];
	}
	
	$user->permission = $length > 13 ? $fields [13] : 1;
	if (! $user->permission || $user->permission == 0) {
		$user->permission = 1;
	}
	
	return true;
}
function create_users($conn, $filename, $classId) {
	$user = new User ();
	$user->classId = $classId;
	$user->permission = 1;
	
	if (! ($stmt = prepare_statement ( $conn, $user ))) {
		return;
	}
	
	$handle = fopen ( $filename, "r" );
	
	if (! $handle) {
		echo "Failed to read uploaded file ", $filename;
		return;
	}
	
	// Skip the header.
	fgets ( $handle );
	
	while ( ($line = fgets ( $handle )) !== false ) {
		if (parseUser ( $user, $line ) && $stmt->execute ()) {
			echo "Created student record for " . $user->name . "<BR>";
		}
		;
	}
	
	fclose ( $handle );
	$stmt->close ();
}
function create_courses($conn, $filename) {
	$course_name = "";
	$sql = "INSERT INTO courses(course_name) VALUES (?)";
	$stmt = $conn->prepare ( $sql );
	$stmt->bind_param ( "s", $course_name );
	
	$handle = fopen ( $filename, "r" );
	
	if (! $handle) {
		echo "Failed to read uploaded file " . $filename . "<BR>";
		return;
	}
	
	// Skip the header.
	fgets ( $handle );
	
	while ( ($line = fgets ( $handle )) !== false ) {
		$course_name = $line;
		
		if (! empty ( $line ) && $stmt->execute ()) {
			echo "Inserted course " . $course_name . "<BR>";
		}
		;
	}
	
	fclose ( $handle );
	$stmt->close ();
}

if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["submit"] )) {
	$classId = $_POST ["classId"];
	
	create_users ( $conn, $_FILES ["users"] ["tmp_name"], intval ( $classId ) );
	create_courses ( $conn, $_FILES ["courses"] ["tmp_name"] );
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
	$sql = 'SELECT * FROM classes';
	$result = $conn->query ( $sql );
	
	if ($result->num_rows > 0) {
		while ( $row = $result->fetch_assoc () ) {
			?>
<option value="<?=$row['id']?>"><?=$row["class_name"]?></option>
<?php
		}
	}
	?>
        </select>
			<div class="padded-element">
				<span>Select course list file to upload</span> <input type="file"
					name="courses" id="courses">
				<div>
					<input type="submit" name="submit">
				</div>
			</div>
		</form>
	</div>

<?php
}

$conn->close ();

?>
</body>
</html>
