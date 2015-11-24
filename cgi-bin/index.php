<html>
<head>
<meta charset="UTF-8">
<title>1506</title>
</head>
<body>
<?php
include "connection.php";

session_start ();

if (! empty ( $_SESSION ['LoggedIn'] ) && ! empty ( $_SESSION ['name'] )) {
	?>

<h1>Member Area</h1>
	<p>
		Thanks for logging in! You are
		<code><?=$_SESSION['name']?></code>
		and your email address is
		<code><?=$_SESSION['email']?></code>
		.
	</p>
    
<?php
} elseif (! empty ( $_POST ['email'] ) && ! empty ( $_POST ['password'] )) {
	$conn = get_connection ();
	
	$email = $conn->real_escape_string ( $_POST ['email'] );
	$password = md5 ( $conn->real_escape_string ( $_POST ['password'] ) );
	
	$result = $conn->query ( "SELECT * FROM students WHERE email = '" . $email . "'" );
	// AND Password = '".$password."'");
	
	if ($result->num_rows > 0) {
		$row = $result->fetch_assoc ();
		$email = $row ["email"];
		
		$_SESSION ['name'] = $row ["name"];
		$_SESSION ['email'] = $email;
		$_SESSION ['LoggedIn'] = 1;
		
		echo "<h1>Success</h1>";
		echo "<p>We are now redirecting you to the member area.</p>";
		echo "<meta http-equiv='refresh' content='=2;./index.php' />";
	} else {
		echo "<h1>Error</h1>";
		echo "<p>Sorry, your account could not be found. Please <a href=\"index.php\">click here to try again</a>.</p>";
	}
} else {
	?>

<h1>Member Login</h1>

	<p>
		Thanks for visiting! Please either login below, or <a
			href="register.php">click here to register</a>.
	</p>

	<div class="center">
		<form method="post" name="loginform" id="loginform">
			<fieldset>
				<label for="email">Email:</label><input type="text" name="email"
					id="email" /><br /> <label for="password">Password:</label><input
					type="password" name="password" id="password" /><br /> <input
					type="submit" name="login" id="login" value="Login" />
			</fieldset>
		</form>
	</div>

<?php
}
?>

 </body>
</html>