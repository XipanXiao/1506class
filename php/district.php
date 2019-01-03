<?php
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";

$medoo = get_medoo();

function get_districts($country = "US") {
	global $medoo;

	return keyed_by_id($medoo->select("districts", "*", ["country" => $country]));
}

function add_district($name, $country = "US") {
	global $medoo;

	return $medoo->insert("districts", ["name" => $name, "country" => $country]);
}

function remove_district($id) {
	global $medoo;

	return $medoo->delete("districts", ["id" => $id]);
}

function get_district_users($district) {
  global $medoo;

	$results = [];

	$users = $medoo->select("users", "*", ["district" => $district]);
	$classes = keyed_by_id($medoo->select("classes",
			["id", "start_year", "department_id"],
			["id[!]" => get_excluded_classes($medoo)]));
	
	$staff = keyed_by_id($medoo->select("staff", "*"), "user");

	foreach ($users as $user) {
		$classInfo = isset($classes[$user["classId"]]) ?
				$classes[$user["classId"]] : null;
		if (!$classInfo) continue;

		$user["year"] = $classInfo["start_year"];
		$user["dep"] = $classInfo["department_id"];
		$user["staff"] = isset($staff[$user["id"]]) ? $staff[$user["id"]] : null;
		array_push($results, $user);
	}
	return $results;
}

$response = null;

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
}

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
	$resource_id = $_GET["rid"];
	if ($resource_id == "districts") {
		$response = get_districts($_GET["country"]);
	} elseif ($resource_id == "users") {
	  $district_id = intval($_GET["district"]);
	  $response = canReadDistrict($user, $district_id)
	      ? get_district_users($district_id)
	      : permission_denied_error();
	}
}

if (is_array($response) && empty($response)) {
  echo '[]';
  return;
}

if ($response) {
  if (is_array($response) && isset($response["updated"]) &&
      intval($response["updated"]) == 0) {
        $response["error"] = get_db_error2($medoo);
      }

  echo json_encode($response);
}
?>
