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
</tr>
<?php
include 'connection.php';

function list_students($conn) {
  $sql = 'SELECT * FROM students';
  $result = $conn->query($sql);

  if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
?>
<tr>
<td><code><?=$row["name"]?></code></td>
<td><code><?=$row["sex"]?></code></td>
<td><code><?=$row["email"]?></code></td>
</tr>
<?php
    }
  } else {
    echo "0 results";
  }
}

$conn = get_connection();
list_students($conn);
$conn->close();
?>

</table>
</div>
</body>
</html>