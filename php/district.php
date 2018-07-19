<?php
include_once "connection.php";
include_once "util.php";

$medoo = get_medoo();

function ensure_district_tables() {
	global $medoo;

  $sql = "CREATE TABLE IF NOT EXISTS districts (".
      "id MEDIUMINT PRIMARY KEY NOT NULL AUTO_INCREMENT,".
      "name VARCHAR(64) NOT NULL,".
      "country CHAR(2) NOT NULL DEFAULT 'US'".
      ");";
  if (!$medoo->query($sql)) return;
  $sql = "ALTER TABLE `districts` ADD UNIQUE `unique_index`(`name`, `country`);";
  $medoo->query($sql);

  $medoo->insert("districts", ["id" => 1, "name" => "纽约地方组"]);
  $medoo->insert("districts", ["id" => 2, "name" => "西雅图地方组"]);
  $medoo->insert("districts", ["id" => 3, "name" => "北加州地方组"]);
  $medoo->insert("districts", ["id" => 4, "name" => "南加州地方组"]);
  $medoo->insert("districts", ["id" => 5, "name" => "新泽西地方组"]);
  $medoo->insert("districts", ["id" => 6, "name" => "波士顿地方组"]);
  $medoo->insert("districts", ["id" => 7, "name" => "德州地方组"]);
  $medoo->insert("districts", ["id" => 8, "name" => "华盛顿DC地方组"]);

  $sql = "CREATE TABLE IF NOT EXISTS zips (".
      "zip CHAR(6) PRIMARY KEY NOT NULL,".
      "district MEDIUMINT,".
      "FOREIGN KEY (district) REFERENCES districts(id)".
      ");";
  $medoo->query($sql);
}

function get_districts($country = "US") {
	global $medoo;

	ensure_district_tables();
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
