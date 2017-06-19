<?php
include_once 'config.php';
include_once 'connection.php';
include_once 'class_prefs.php';
include_once 'tables.php';
include_once 'util.php';

if (!empty($_POST["id"])) exit();

if(! empty ( $_POST ['email'] ) && ! empty ( $_POST ['name'] )) {
  $password = md5 ( $_POST ['password'] );  
  $users = get_users($_POST['email']);
  
  if (sizeof($users) > 0) {
    echo "<h1>Error</h1>";
    echo "<p>Email address ".$_POST["email"]. "has already been registered.</p>";
    exit();
  }

  date_default_timezone_set("UTC");
  $user = update_user($_POST);
  if (!$user) {
    echo "<h1>Error</h1>";
    echo "<p>Failed to register ".$_POST["email"]. get_db_error();
    exit();
  }
    
  $_SESSION['user'] = serialize($user);
  random_assign_prefs($user);
 
  $url = sprintf("../registered.html?name=%s&email=%s", $user->name,
      $user->email);
  client_redirect($url, 1, 'Registered, redirecting...');
}
?>
