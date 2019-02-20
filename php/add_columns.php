<?php
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
  if (!isSysAdmin($user)) exit();
}

$medoo = get_medoo();

function add_district_cfo($medoo) {
  $medoo->update("districts", ["stock" => 1],
      ["AND" => ["name" => "南加州", "stock" => 0]]);
  $results = $medoo->select("districts", "paypal_client_id");
  if (!empty($results)) return;

  $sql = "ALTER TABLE districts
      ADD COLUMN cfo_name VARCHAR(20) CHARACTER SET utf8,
      ADD COLUMN cfo_email VARCHAR(40) CHARACTER SET utf8,
      ADD COLUMN cfo_street VARCHAR(255) CHARACTER SET utf8,
      ADD COLUMN cfo_city VARCHAR(32) CHARACTER SET utf8,
      ADD COLUMN cfo_state TINYINT,
      ADD COLUMN cfo_country CHAR(2),
      ADD COLUMN cfo_zip CHAR(6),
      ADD COLUMN cfo_phone VARCHAR(16) CHARACTER SET utf8;";
  $medoo->query($sql);
  echo get_db_error2($medoo);

  $sql = "ALTER TABLE districts
      ADD COLUMN paypal_client_id VARCHAR(256);";
  $medoo->query($sql);
  echo get_db_error2($medoo);
}

add_district_cfo($medoo);
?>
