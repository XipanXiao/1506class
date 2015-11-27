<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="../style.css"></link>
<title>1506</title>
</head>
<body>

<?php
include_once "connection.php";
include_once "tables.php";
include_once "app_bar.php";

if(! empty ( $_POST ['email'] ) && ! empty ( $_POST ['password'] )) {
	$conn = get_medoo ();
	
	$password = md5 ( $_POST ['password'] );	
	$users = get_user($conn, $_POST['email']);
	
	if (sizeof($users) > 0) {
		$_SESSION['user'] = current($users);
		
		header("Location: ./index.php");
		exit();
	} else {
		echo "<h1>Error</h1>";
		echo "<p>Sorry, your account could not be found. Please <a href=\"index.php\">click here to try again</a>.</p>";
	}
} else {
?>

<h1 class="center">Member Login</h1>

	<p class="center">
		Thanks for visiting! Please either login below, or <a
			href="register.php">click here to register</a>.
	</p>

	<div class="center css-table">
		<form method="post" name="loginform" id="loginform">
			<fieldset>
				<div class="css-table-row">
					<label class="css-table-cell" for="email">Email:</label>
					<input class="css-table-cell" type="text" name="email" id="email"/>
				</div>
				<div class="css-table-row">
					<label class="css-table-cell" for="password">Password:</label>
					<input class="css-table-cell" type="password" name="password" id="password" />
				</div>
				<input type="submit" name="login" id="login" value="Login" />
			</fieldset>
		</form>
	</div>

<?php
}
?>

</body>
</html>

