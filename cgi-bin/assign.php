<?php

include_once 'config.php';
include_once 'connection.php';
include_once 'class_prefs.php';
include_once 'tables.php';
include_once 'util.php';

$users = get_users(null, 1);
foreach ($users as $user) {
	random_assign_prefs($user);
}

?>
