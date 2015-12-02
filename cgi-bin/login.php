<?php
include_once "connection.php";
include_once "tables.php";

if(! empty ( $_POST ['email'] ) && ! empty ( $_POST ['password'] )) {
	$password = md5 ( $_POST ['password'] );	
	$users = get_users($_POST['email']);
	
	if (sizeof($users) > 0) {
		$user = current($users);
		$_SESSION['LoggedInUser'] = serialize($user);
		
		$page = ($user->permission & 2) ? "admin.html" : "homework_report.html";
		echo sprintf('<html><head><meta http-equiv="refresh" content="0; url=%s"/></head></html>',
				'../'. $page);
	} else {
		echo "<h1>Error</h1>";
		echo "<p>Sorry, your account could not be found. Please <a href=\"../login.html\">click here to try again</a>.</p>";
	}
}
?>
