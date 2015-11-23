<html>
<body>
<?php
include 'connection.php';

function insert($conn, $student) {
  // """insert a student record to the students table"""
  $statement = $conn->prepare("INSERT INTO students 
     (name, sex, nickname, email, phone, Address, yy, qq, wechat)
     values(?, ?, ?, ?, ?, ?, ?, ?, ?)");

  $sex = $student['sex'] == 'true';
  $statement-> bind_param('sisssssss', $student['name'], $sex,
      $student['nickname'], $student['email'], $student['phone'], $student['Address'], 
      $student['yy'], $student['qq'], $student['wechat']);

  $statement->execute();
  $statement->close();
}

if ($_GET['name'] == null) {
  echo 'name is missing';
} else {
  $conn = get_connection();
  insert($conn, $_GET);
}
?>
</body>
</html>
