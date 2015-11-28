<div class="app-bar">
<?php
include_once 'datatype.php';
include_once 'tables.php';

if (empty($_SESSION)) {
	session_start ();
}

if (empty ( $_SESSION ['user'] ) ) {
	header("Location: login.php");
	exit();
}

$user = unserialize($_SESSION['user']);
$classes = get_classes();

$class_name = array_key_exists($user->classId, $classes) ? $classes[$user->classId]->name : "";
?>
	<div class="left">
		<span><?=$class_name?></span>
	</div>
	<div class="right">
		<span><?=$user->name?></span>
		<a class="app-bar-link" href="logout.php">Logout</a> 
	</div>
</div>
<hr>
