<div class="app-bar">
	<div class="right">
<?php
session_start ();

if (! empty ( $_SESSION ['user'] ) ) {
?>
		<span><?=$_SESSION['user']->name?></span>
		<a href="logout.php">Logout</a> 
<?php
} else {
	header("Location: login.php");
}
?>
	</div>
</div>
