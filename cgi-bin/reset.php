<html>
<head>
<title>Reset data</title>
</head>

<body>

<?php
include "connection.php";


function create_database($conn) {
  // Create database
  if ($conn->query("CREATE DATABASE buddcourses") === TRUE) {
    echo "Database created successfully";
  } else {
    echo "Error creating database: " . $conn->error;
  }
    
  echo "<br>";
}
    
function create_table($conn) {
        
  //"""Creates tables"""
  if (!$conn->query("DROP TABLE IF EXISTS students")) {
    return false;
  }

  return $conn->query("CREATE TABLE students(
      id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      internalId VARCHAR(8),
      name VARCHAR(32),
      password VARCHAR(32),
      sex BOOLEAN,
      nickname VARCHAR(32),
      email VARCHAR(32) NOT NULL,
      phone VARCHAR(16),
      Address VARCHAR(64),
      yy VARCHAR(16),
      qq VARCHAR(16),
      wechat VARCHAR(32),
      classId INT,
      mentor VARCHAR(32),
      response VARCHAR(16),
      permission INT,
      notes VARCHAR(255))");
}

if ($_SERVER["REQUEST_METHOD"] == "POST" &&
    $_POST["answer"] == "Xiaohuang") {
  $conn = get_connection();
  create_database($conn);
  $created = create_table($conn);
  echo "Table dropped and re-created";
} else {
?>
<form method="POST">
  <label>
    What is the name your first pet?
    <input name="answer">
  </label>
  <input type="submit">
</form>
<?php
}

?>
</body>
</html>