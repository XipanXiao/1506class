<?php
include_once 'config.php';

$_SESSION ['user'] = '';

session_destroy();

header('Location: ../login.html');
?>
