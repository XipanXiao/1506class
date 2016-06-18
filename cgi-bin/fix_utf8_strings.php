<?php
/*
include_once "config.php";
include_once "connection.php";
include_once "tables.php";
include_once "util.php";
include_once 'permission.php';

if (empty($_SESSION["user"])) {
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
  if (!isSysAdmin($user)) exit();
  
  $tables = [
    "classes" => [
    		"name",
    		"email",
    		"class_room"
    ],
  	"courses" => [
  			"name",
  			"video_url",
  			"text_url",
  	],
  	"course_groups" => [
  			"name",
  			"url",
    ],
  	"departments" => ["name"],
  	"schedule_groups" => ["name"],
  	"tasks" => ["name", "zb_name"],
  	"users" => [
  			"email",
  			"internal_id",
  			"name",
  			"nickname",
  			"im",
  			"phone",
  			"city",
  			"state",
  			"country",
  			"occupation",
  			"skills",
  			"comments"
  	]
  ];

  $medoo = get_medoo("latin1");
  foreach ($tables as $table => $fields) {
  	$sql = sprintf("alter table %s convert to character set latin1 collate default;",
  			$table);
  	if (!$medoo->exec($sql)) {
  		echo "failed to convert ". $table;
  		exit();
  	}
  }
  $results = [];
  foreach ($tables as $table => $fields) {
  	$results[$table] = $medoo->select($table, array_merge($fields, ["id"]));
  	$sql = sprintf("alter table %s convert to character set utf8 collate utf8_unicode_ci;",
  			$table);
  	if (!$medoo->exec($sql)) {
  		echo "failed to convert ". $table;
  		exit();
  	}
  }
  $medoo = get_medoo("utf8");
  foreach ($tables as $table => $fields) {
  	$records = $results[$table];
  	foreach($records as $record) {
  		$id = $record["id"];
  		unset($record["id"]);

  		if (!$medoo->update($table, $record, ["id" => $id])) {
  			echo "failed to update " . $table . " where id=". $id . "<br>";
  		}
  	}
  }
}
*/
?>
