<?php
include_once "config.php";
include_once "connection.php";
include_once "tables.php";
include_once "util.php";
include_once 'permission.php';

function fix_birthday($birthday) {
	$birthday = str_replace("-00", "-01", $birthday);
	$birthday = str_replace("0000-", "1990-", $birthday);
	$birthday = str_re("-00-", "-01-", $birthday);
}

if (empty($_SESSION["user"])) {
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
  if (!isSysAdmin($user)) exit();

  global $medoo;
  $users = $medoo->select("users", ["id", "birthday"]);
  foreach ($users as $user) {
  	$user["birthday"] = fix_birthday($user["birthday"]);
  	update_user($user);
  }
}
?>
