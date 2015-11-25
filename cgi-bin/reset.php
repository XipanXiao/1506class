<html>
<head>
<title>Reset data</title>
</head>

<body>

<?php
include "connection.php";
function create_database($conn) {
	// Create database
	if ($conn->query ( "CREATE DATABASE buddcourses" ) === TRUE) {
		echo "Database created successfully";
	} else {
		echo "Error creating database: " . $conn->error;
	}
	
	echo "<br>";
}
function create_table($conn) {
	
	// """Creates tables"""
	$conn->query ( "DROP TABLE IF EXISTS users" );
	
	if (! $conn->query ( "CREATE TABLE users(
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      internalId VARCHAR(8),
      name VARCHAR(32),
      password VARCHAR(32),
      sex BOOLEAN,
      nickname VARCHAR(32),
      email VARCHAR(32) NOT NULL,
      phone VARCHAR(16),
      address VARCHAR(64),
      yy VARCHAR(16),
      qq VARCHAR(16),
      wechat VARCHAR(32),
      classId MEDIUMINT,
      mentor VARCHAR(32),
      response VARCHAR(16),
      permission INT,
      notes VARCHAR(255))" )) {
		echo "Failed to create table student:" . $conn->error . "<BR>";
	}
	
	$conn->query ( "DROP TABLE IF EXISTS learning_records" );
	if (! $conn->query ( "CREATE TABLE learning_records (
                 student_id INT not null,
                 class_id MEDIUMINT,
                 action_type TINYINT not null,
                 action_sub_type VARCHAR(32),
                 action_count INT not null,
                 ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                 )" )) {
		echo "Failed to create table learning_records:" . $conn->error . "<BR>";
	}
	
	$conn->query ( "DROP TABLE IF EXISTS action_types" );
	if (! $conn->query ( "CREATE TABLE action_types (
                          id TINYINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                          action_type VARCHAR(32),
						  value_type TINYINT
                          )" )) {
		echo "Failed to create table action_types:" . $conn->error . "<BR>";
	}
	
	$action_type = "";
	$value_type = 0;
	$stmt = $conn->prepare ( "INSERT INTO action_types(action_type, value_type) VALUES (?, ?)" );
	$stmt->bind_param ( "si", $action_type, $value_type );
	
	foreach ( array (
			"参加共修" => 1,
			"金刚萨埵心咒" => 0,
			"顶礼" => 0,
			"观修" => 0,
			"听传承" => 1,
			"看法本" => 1 
	) as $action_type_ => $value_type_ ) {
		$action_type = $action_type_;
		$value_type = $value_type_;
		if (! $stmt->execute ()) {
			echo "Failed to insert action type" . $action_type . $conn->error . "<BR>";
		}
	}
	
	$conn->query ( "DROP TABLE IF EXISTS classes" );
	if (! $conn->query ( "CREATE TABLE classes (
                              id TINYINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              class_name VARCHAR(32),
							  teacherId INT
                              )" )) {
		echo "Failed to create table classes:" . $conn->error . "<BR>";
	}
	
	$class_name = "";
	$stmt = $conn->prepare ( "INSERT INTO classes(class_name) VALUES (?)" );
	$stmt->bind_param ( "s", $class_name );
	$classes = array (
			"加行（周二）",
			"加行（周四）",
			"净土（周一）",
			"入行论（周四）",
			"入行论（周六）" 
	);
	
	foreach ( $classes as $class_name_ ) {
		$class_name = $class_name_;
		if (! $stmt->execute ()) {
			echo "Failed to insert class name" . $class_name . $conn->error . "<BR>";
		}
	}
	
	$conn->query ( "DROP TABLE IF EXISTS courses" );
	if (! $conn->query ( "CREATE TABLE courses (
                                  id TINYINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                  course_name VARCHAR(32)
                                  )" )) {
		echo "Failed to create table courses:" . $conn->error . "<BR>";
	}
}

if ($_SERVER ["REQUEST_METHOD"] == "POST" && $_POST ["answer"] == "Xiaobai") {
	$conn = get_connection ();
	create_database ( $conn );
	$created = create_table ( $conn );
	echo "Table dropped and re-created";
} else {
	?>
<form method="POST">
		<label> What is the name your first pet? <input name="answer">
		</label> <input type="submit">
	</form>
<?php
}

?>
</body>
</html>