<?php
include_once "connection.php";
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

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
	$resource_id = $_GET["rid"];
	if ($resource_id == "districts") {
		$response = get_districts($_GET["country"]);
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
