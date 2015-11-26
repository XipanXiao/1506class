<html>
<head>
<meta charset="UTF-8">
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
      internal_id VARCHAR(8),
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
      class_id MEDIUMINT,
      mentor VARCHAR(32),
      response VARCHAR(16),
      permission INT,
      notes VARCHAR(255))" )) {
		echo "Failed to create table student:" . $conn->error . "<BR>";
	}
	
	$conn->query ( "DROP TABLE IF EXISTS tasks" );
	if (! $conn->query ( "CREATE TABLE tasks (
                          id TINYINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                          task_name VARCHAR(32),
						  task_type TINYINT
                          )" )) {
		echo "Failed to create table tasks:" . $conn->error . "<BR>";
	}
	
	$task_name = "";
	$task_type = 0;
	$stmt = $conn->prepare ( "INSERT INTO tasks(task_name, task_type) VALUES (?, ?)" );
	$stmt->bind_param ( "si", $task_name, $task_type );
	
	foreach ( array (
			"参加共修" => 1,
			"金刚萨埵心咒" => 0,
			"顶礼" => 0,
			"观修" => 0,
			"听传承" => 1,
			"看法本" => 1,
			"第1修法" => 1,
			"第2修法" => 1,
			"第3修法" => 1,
			"第4修法" => 1,
			"第5修法" => 1,
			"第6修法" => 1
	) as $action_type_ => $value_type_ ) {
		$task_name = $action_type_;
		$task_type = $value_type_;
		if (! $stmt->execute ()) {
			echo "Failed to insert task" . $task_name . $conn->error . "<BR>";
		}
	}
	
	$conn->query ( "DROP TABLE IF EXISTS classes" );
	if (! $conn->query ( "CREATE TABLE classes (
                              id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              class_name VARCHAR(32),
							  teacher_id INT,
							  start_date DATETIME
                              )" )) {
		echo "Failed to create table classes:" . $conn->error . "<BR>";
	}
	
	$class_name = "";
	date_default_timezone_set('America/Los_Angeles');
	$start_date = date ("Y-m-d H:i:s", mktime(0,0,0,11,29,2015));

	$stmt = $conn->prepare ( "INSERT INTO classes(class_name, start_date) VALUES (?, ?)" );
	$stmt->bind_param ( "ss", $class_name, $start_date );
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

	$conn->query ( "DROP TABLE IF EXISTS schedules" );
	if (! $conn->query ( "CREATE TABLE schedules (
                                  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
								  week TINYINT,
								  class_id TINYINT,
								  course_id TINYINT
                                  )" )) {
		echo "Failed to create table schedules:" . $conn->error . "<BR>";
	}

	$conn->query ( "DROP TABLE IF EXISTS assignments" );
	if (! $conn->query ( "CREATE TABLE assignments (
                                  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                  task_id TINYINT,
							      class_id TINYINT,
								  schedule_id TINYINT
                                  )" )) {
		echo "Failed to create table assignments:" . $conn->error . "<BR>";
	}

	$conn->query ( "DROP TABLE IF EXISTS learning_records" );
	if (! $conn->query ( "CREATE TABLE learning_records (
                 student_id INT not null,
                 assignment_id INT,
				 count INT,
                 ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                 )" )) {
		echo "Failed to create table learning_records:" . $conn->error . "<BR>";
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