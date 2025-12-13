<?php
include_once 'config.php';
include_once 'datatype.php';
include_once 'tables.php';
include_once 'permission.php';
include_once 'connection.php';
include_once 'util.php';

$response = null;

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
}

function is_same_user_graduated($targetUser) {
    global $user;
    return $user->getBaseId() === $targetUser->getBaseId();
}

function find_same_user_in_class($classId) {
    global $medoo, $user;

    $baseId = $user->getBaseId();

    $target = $medoo->get("users", "*", [
        "classId" => $classId,
        "OR" => [
            "id" => $baseId,
            "original_id" => $baseId
        ]
    ]);

    return $target ? new User($target) : null;
}

if ($_SERVER ["REQUEST_METHOD"] == "GET") {
  $targetUserId = $_GET["user"];
  $targetClassId = $_GET["class_id"];
  if (empty($targetUserId) && empty($targetClassId)) return;

  $targetUser = empty($targetClassId) ?
    get_users(null, null, $targetUserId)[$targetUserId]:
    find_same_user_in_class($targetClassId);
  if (!$targetUser) return;

  if (!canWriteUser($user, $targetUser) && !is_same_user_graduated($targetUser)) return;
  $targetUser->password = null;
  $targetUser->is_teacher = is_teacher($targetUser->id);

  $_SESSION["user"] = serialize($targetUser);
  header("Location: ../index.html");
}
?>
