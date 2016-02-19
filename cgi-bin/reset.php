<html>
<head>
<meta charset="UTF-8">
<title>Reset data</title>
</head>

<body>

<?php
include_once "connection.php";

if ($_SERVER ["REQUEST_METHOD"] == "POST" && $_POST ["answer"] == $config->pet) {
	$conn = get_connection ();
	$commands = file_get_contents("create_tables.php") . file_get_contents("../data/create_users.php");
	date_default_timezone_set("UTC");
	
	$conn->multi_query($commands);
	$lines = explode(";", $commands);
	$commands_succeeded = 0;
	while ($result = $conn->next_result()) {
		$commands_succeeded ++;
		echo $lines[$commands_succeeded] . "<BR>";
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
