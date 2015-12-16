<?php
include_once 'config.php';
include_once 'connection.php';
include_once 'tables.php';
include_once 'util.php';

if(! empty ( $_POST ['email'] ) && ! empty ( $_POST ['password'] )) {
	$password = md5 ( $_POST ['password'] );	
	$users = get_users($_POST['email']);
	
	if (sizeof($users) > 0) {
		$user = current($users);
		
		if ($password != $user->password) {
			echo "<h1>Error</h1>";
			echo "<p>Password does not match.</p>";
			exit();
		}
		
		$_SESSION['user'] = serialize($user);
		
		$page = $user->permission > 2 ? 'admin.html' : 'index.html';
		client_redirect('../'.$page, 1, 'Authenticated successfully, redirecting...');
	} else {
		echo "<h1>Error</h1>";
		echo "<p>Sorry, your account could not be found. Please <a href=\"../login.html\">click here to try again</a>.</p>";
	}
}
?>
