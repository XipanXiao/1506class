<?php
include_once "config.php";
include_once "connection.php";
include_once "tables.php";

$medoo = get_medoo();
$users = $medoo->select("users", ["id", "birthday"]);
date_default_timezone_set("UTC");

foreach ($users as $user) {
	if (empty($user["birthday"])) continue;
	
	$parts = explode("-", $user["birthday"]);
	if (count($parts) != 3) continue;
	
	$birthday = $parts[0] . "-". $parts[1] . "-00";

	echo "updating " . $user["id"] . " birthday to " . $birthday . "...";
	$updated = $medoo->update("users", ["birthday" => $birthday],
			["id" => $user["id"]]);
	echo $updated . "<br>";
}
?>
