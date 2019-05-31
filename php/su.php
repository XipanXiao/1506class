<?php
include_once 'config.php';
include_once 'tables.php';
include_once 'permission.php';

$response = null;

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
}

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["user"] )) {
  $targetUserId = $_GET["user"];
  if (empty($targetUserId)) return;

  $targetUser = get_users(null, null, $targetUserId)[$targetUserId];
  if (!$targetUser) return;

  if (!canWriteUser($user, $targetUser)) return;
  $targetUser->password = null;
  $targetUser->is_teacher = is_teacher($targetUser->id);

  $_SESSION["user"] = serialize($targetUser);
  header("Location: ../index.html");
}
?>
