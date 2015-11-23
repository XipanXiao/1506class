<html>
 <head>
  <title>PHP Test</title>
 </head>
 <body>
 <?php
echo '<p>Hello World</p>';

$servername = 'bookexercisecom.ipagemysql.com';
$username = 'yuanyin_01';
$password = 'yuanyin_01';

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Connected successfully";
?>

 </body>
</html>