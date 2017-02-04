<?php
/// 分班用的各种函数。
include_once "datatype.php";
include_once "connection.php";
include_once "util.php";

$medoo = get_medoo();

function table_exists($table) {
	global $medoo;
	
	$result = $medoo->query("SELECT 1 FROM ". $table. " LIMIT 1");
	return !empty($result);
}

function create_class_pref_table() {
  global $medoo;

  $name = "class_prefs";
  if (table_exists($name)) return;
  
  $result = $medoo->query("CREATE TABLE ". $name. "(
  		user_id INT,
      FOREIGN KEY (user_id) REFERENCES users(id),
  		pref1 INT,
      FOREIGN KEY (pref1) REFERENCES classes(id),
  		pref2 INT,
      FOREIGN KEY (pref2) REFERENCES classes(id),
  		ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  		)");
  if (empty($result)) {
  	error_log($medoo->error());
  }
}

function trim_old_class_prefs() {
	global $medoo;
	
	$medoo->query("DELETE FROM class_prefs WHERE `ts`". 
			" < DATE_SUB(NOW(), INTERVAL 1 YEAR)");
}

function get_class_prefs($user_id) {
	global $medoo;

	create_class_pref_table();
	$results = $medoo->select("class_prefs", 
			["user_id", "pref1", "pref2"],
			$user_id == null ? null : ["user_id" => $user_id]);
	$response = [];
	foreach ($results as $result) {
		$response[$result["user_id"]] = [
				"pref1" => intval($result["pref1"]),
				"pref2" => intval($result["pref2"]),				
		];
	}
	return $response;
}

function update_class_pref($user_id, $pref1, $pref2) {
	global $medoo;

	create_class_pref_table();
	trim_old_class_prefs();

	$data = [];
	if ($pref1) $data["pref1"] = $pref1;
	if ($pref2) $data["pref2"] = $pref2;
	$where = ["user_id" => $user_id];

	$rows = $medoo->update("class_prefs", $data, $where);
	if ($rows) return $rows;
	
	return $medoo->insert("class_prefs", array_merge($data, $where));
}

function get_class_candidates($user) {
	global $medoo;

	$start_year = $user->classInfo["start_year"];

	$undeleted = ["deleted[!]" => 1, "deleted" => NULL];
	$classes = keyed_by_id($medoo->select("classes", "*", ["AND" =>
			[
					"start_year" => $start_year,
					"department_id" => 1,
					"id[!]" => 1, 
					"OR" => $undeleted]]));

	if ($user->classId == 1) return $classes;
	
	$dep_id = $user->classInfo["department_id"];
	return array_filter($classes, function($classInfo) use($dep_id){
    return $dep_id != $classInfo["department_id"];
  });
}

function random_assign_prefs($user) {
	$classes = array_keys(get_class_candidates($user));
	$pref1 = $classes[rand(0, count($classes) - 1)];
	$pref2 = $classes[rand(0, count($classes) - 1)];
	update_class_pref($user->id, $pref1, $pref2);
}
?>
