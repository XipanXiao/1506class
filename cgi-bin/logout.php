<?php
$_SESSION ['LoggedInUser'] = '';

session_destroy();

header('Location: ../login.html');
?>
