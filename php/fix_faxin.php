<?php
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";
include_once "tables.php";

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
  if (!isSysAdmin($user)) exit();
}

function startsWith($haystack, $needle)
{
     $length = strlen($needle);
     return (substr($haystack, 0, $length) === $needle);
}

$medoo = get_medoo();

$classIds = $medoo->select("classes", "id", ["AND" => ["start_year" => 2015, "graduated" => 1]]);
$users = $medoo->select("users", ["id", "email"], ["classId" => $classIds]);
foreach ($users as $user) {
  if (!startsWith($user["email"], "15")) continue;

  $id = intval($user["id"]);
  $parts = explode(".", $user["email"]);
  array_shift($parts);
  $email = join(".", $parts);

  $newIds = $medoo->select("users", "id", ["email" => $email]);
  if (empty($newIds)) continue;
  $newId = current($newIds);

  if ($medoo->update2("staff", ["user" => $newId], ["user" => $id])) {
    echo sprintf("Fixed for %s, changed user from %d to %d<br>\n", $email, $id, $newId);
  }
}
?>
