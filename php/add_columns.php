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
  $results = $medoo->select("districts", "paypal_client_id");
  if (!empty($results)) return;

  $medoo->update("districts", ["stock" => 1],
      ["AND" => ["name" => "南加州", "stock" => 0]]);

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

function add_teacher_for_schedules($medoo) {
  $results = $medoo->select("schedules", "teacher_planned");
  if (!empty($results)) return;

  $medoo->query("ALTER TABLE schedules
      ADD COLUMN teacher_planned INT,
      ADD FOREIGN KEY fk_teacher_planned(teacher_planned)
          REFERENCES users(id);");
  $medoo->query("ALTER TABLE schedules
      ADD COLUMN teacher INT,
      ADD FOREIGN KEY fk_teacher(teacher) REFERENCES users(id);");
}

function add_shipping_donation_for_orders($medoo) {
  $sql = "ALTER TABLE orders
      ADD COLUMN shipping_donation decimal(10, 2);";
  $medoo->query($sql);  
}

function migrate_inventory() {
  global $medoo;

  $sql = "INSERT INTO inventory (item_id, stock) ".
    "SELECT items.id, items.stock FROM items";
  $medoo->query($sql);
}

function create_inventory_tables() {
  global $medoo;

  if (table_exists($medoo, "inventory")) return;

  $sql = "UPDATE orders SET district = 2 WHERE (district NOT IN (1, 2)) OR (district is NULL);";
  $medoo->query($sql);
  $sql = "ALTER TABLE orders MODIFY district MEDIUMINT NOT NULL DEFAULT 2;";
  $medoo->query($sql);

  $sql = "CREATE TABLE inventory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_id INT NOT NULL,
          FOREIGN KEY (item_id) REFERENCES items(id),
      district MEDIUMINT NOT NULL DEFAULT 2,
          FOREIGN KEY (district) REFERENCES districts(id),
      stock INT NOT NULL DEFAULT 0,
      UNIQUE(item_id, district)
      );";
  $medoo->query($sql);

  migrate_inventory();
}

add_district_cfo($medoo);
add_teacher_for_schedules($medoo);
add_shipping_donation_for_orders($medoo);
create_inventory_tables($medoo);
?>
