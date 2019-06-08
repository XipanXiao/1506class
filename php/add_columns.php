<html>
<head>
<meta charset="UTF-8">
</head>
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

function column_exists($medoo, $table, $column) {
  $results = $medoo->select($table, $column, ["LIMIT" => 1]);
  if (!empty($results)) {
    echo $table. ".". $column. " exists, doing nothing<br>";
    return True;
  }
  return False;
}

function add_district_cfo($medoo) {
  if (column_exists($medoo, "districts", "paypal_client_id")) {
    return;
  }

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
  if (column_exists($medoo, "schedules", "teacher_planned")) {
    return;
  }

  $medoo->query("ALTER TABLE schedules
      ADD COLUMN teacher_planned INT,
      ADD FOREIGN KEY fk_teacher_planned(teacher_planned)
          REFERENCES users(id);");
  $medoo->query("ALTER TABLE schedules
      ADD COLUMN teacher INT,
      ADD FOREIGN KEY fk_teacher(teacher) REFERENCES users(id);");
}

function add_shipping_donation_for_orders($medoo) {
  if (column_exists($medoo, "orders", "shipping_donation")) {
    return;
  }

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

  if (table_exists($medoo, "inventory")) {
    echo "inventory table exists, doing nothing<br>";
    return;
  };

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

function create_org_tables($medoo) {    
  if (table_exists($medoo, "organizations")) {
    echo "organizations table exists, doing nothing<br>";
    return;
  };

  $sql = "CREATE TABLE organizations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      parent INT,
          FOREIGN KEY (parent) REFERENCES organizations(id),
      name VARCHAR(32) CHARACTER SET utf8
    );";
  $medoo->query($sql);
  $medoo->insert("organizations", ["id" => 1, "name" => "教学部"]);
  $medoo->insert("organizations", ["id" => 2, "name" => "弘法部"]);
  $medoo->insert("organizations", ["id" => 3, "name" => "综合部"]);

  $sql = "CREATE TABLE staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user INT NOT NULL,
        FOREIGN KEY (user) REFERENCES users(id),
    manager INT,
        FOREIGN KEY (manager) REFERENCES users(id),
    organization INT NOT NULL,
        FOREIGN KEY (organization) REFERENCES organizations(id),
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user)
  );";
  $medoo->query($sql);

  $sql = "ALTER TABLE staff ADD COLUMN manager_name".
      " VARCHAR(32) CHARACTER SET utf8";
  $medoo->query($sql);
}

function add_staff_columns($medoo) {
  if (column_exists($medoo, "staff", "title")) {
    return;
  }

  $sql = "ALTER TABLE staff
      ADD COLUMN title TINYINT,
      ADD COLUMN free_time TINYINT;
      ";
  $medoo->query($sql);
}

function rename_course($name) {
  $maps = [
    "/前行广释[^\d]*([\d]+).*/" => "前行$1",
    "/莲师金刚七句略讲第([\d]+)课/" => "金刚七句$1",
    "/二十一度母赞释第([\d]+)课/" => "度母$1",
    "/入行论[^\d]*([\d]+).*/" => "入行论$1",
    "上师瑜伽•祈祷莲师" => "祈祷莲师",
    "前行之重要性" => "前行重要性",
    "《上师瑜伽速赐加持》讲记" => "上师瑜伽",
    "/第(\d)+课/" => "$1",
  ];
  foreach ($maps as $from => $to) {
    $newName = preg_replace($from, $to, $name);
    if ($newName != $name) {
      echo "renamed ". $name. " to ". $newName. "<br>";
      return $newName;
    }
  }
  return $name;
}

function rename_courses($medoo) {
  $courses = $medoo->select("courses", ["id", "zb_name"]);
  $updated = 0;
  foreach($courses as $course) {
    $updated += $medoo->update("courses",
        ["zb_name" => rename_course($course["zb_name"])],
        ["id" => $course["id"]]);
  }
  echo "updated zb_name for ". $updated. " courses.<br>";
}

function add_zb_name_for_courses($medoo) {
  if (column_exists($medoo, "courses", "zb_name")) {
    // return;
  }
  $sql = "ALTER TABLE courses
      ADD COLUMN zb_name VARCHAR(64) CHARACTER SET utf8;";
  $medoo->query($sql);
  $medoo->query("UPDATE courses set zb_name=name;");
  rename_courses($medoo);
}

add_district_cfo($medoo);
add_teacher_for_schedules($medoo);
add_shipping_donation_for_orders($medoo);
create_inventory_tables($medoo);
create_org_tables($medoo);
add_staff_columns($medoo);
add_zb_name_for_courses($medoo);
?>
</html>
