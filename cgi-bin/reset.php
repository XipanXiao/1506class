<html>
<head>
<meta charset="UTF-8">
<title>Reset data</title>
</head>

<body>

<?php
include "connection.php";

if ($_SERVER ["REQUEST_METHOD"] == "POST" && $_POST ["answer"] == "Xiaobai") {
	$conn = get_connection ();
	$commands = file_get_contents("create_tables.sql");
	$conn->multi_query($commands);
	
	$commands_succeeded = 0;
	while ($result = $conn->next_result()) {
		$commands_succeeded ++;
	}
	
	echo "Executed ". $commands_succeeded. " commands <BR>";
	echo $conn->error . "<BR>";
	
	$conn->close();

	echo "Tables re-created";
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