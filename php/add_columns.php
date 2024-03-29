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
  if (!isCountryAdmin($user)) exit();
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

  $medoo->update2("districts", ["stock" => 1],
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
  $medoo->insert2("organizations", ["id" => 1, "name" => "教学部"]);
  $medoo->insert2("organizations", ["id" => 2, "name" => "弘法部"]);
  $medoo->insert2("organizations", ["id" => 3, "name" => "综合部"]);

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
  $oldName = $name;
  $name = preg_replace("/《|》|\s/", "", $name);
  $maps = [
    "/前行广释[^\d]*([\d]+).*/" => "前行$1",
    "/莲师金刚七句略讲第([\d]+)课/" => "金刚七句$1",
    "/二十一度母赞释第([\d]+)课/" => "度母$1",
    "/入行论[^\d]*([\d]+).*/" => "入行论$1",
    "/二规教言论讲记第(\d+)课/" => "二规$1",
    "/佛子行讲记第(\d+)课/" => "佛子行$1",
    "/佛说阿弥陀经释第(\d+)课/" => "弥陀经$1",
    "/普贤行愿品释第(\d+)课/" => "普贤行愿品$1",
    "/亲友书讲记第(\d+)课/" => "亲友书$1",
    "/藏传净土[^\d]*(\d+).*/" => "藏净$1",
    "/修心利刃轮[^\d]*(\d+).*/" => "利刃轮$1",
    "/第(\d+)课/" => "$1",
    "/上师瑜伽•祈祷莲师/" => "祈祷莲师",
    "/前行之重要性/" => "前行重要性",
    "/上师瑜伽速赐加持讲记/" => "上师瑜伽",
    "/六字真言转经轮之功德/" => "转经轮功德",
    "/修心八颂要义/" => "修心八颂",
    "/饮酒之过患/" => "饮酒过患",
    "/吃肉之过患/" => "吃肉过患",
    "/讲记/" => "",
  ];
  foreach ($maps as $from => $to) {
    $newName = preg_replace($from, $to, $name);
    if ($newName != $name) {
      $name = $newName;
      break;
    }
  }
  if ($name == $oldName) {
    echo "setting zb_name to ". $name. "...";
  } else {
    echo "renaming zb_name from ". $oldName. " to ". $name. "...";
  }
  return $name;
}

function rename_courses($medoo) {
  $courses = $medoo->select("courses", ["id", "name"]);
  $updated = 0;
  $renamed = 0;
  foreach($courses as $course) {
    $newName = rename_course($course["name"]);
    $result = $medoo->update2("courses",
        ["zb_name" => $newName],
        ["id" => $course["id"]]);
    $updated += $result;
    if ($result) {
      $renamed += ($newName == $course["name"] ? 0 : 1);
      echo "done<br>\n";
    } else {
      echo "Failed: ". get_db_error2($medoo). "<br>\n";
    }
  }
  echo "updated zb_name for ". $updated. " courses, among them renamed ". $renamed. ".<br>";
}

function add_zb_name_for_courses($medoo) {
  if (column_exists($medoo, "courses", "zb_name")) {
    return;
  }
  $sql = "ALTER TABLE courses
      ADD COLUMN zb_name VARCHAR(64) CHARACTER SET utf8;";
  $medoo->query($sql);
  rename_courses($medoo);
}

function add_task_records_half_term($medoo) {
  if (column_exists($medoo, "task_records", "half_term")) {
    return;
  }

  $sql = "ALTER TABLE task_records
      ADD COLUMN half_term INT;";
  $medoo->query($sql);
  echo get_db_error2($medoo);
  echo $medoo->last_query();
}

function change_task_records_timestamp($medoo) {
  $sql = "ALTER TABLE task_records
      MODIFY ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;";
  $medoo->query($sql);
  echo $medoo->last_query(). "<br>\n";
}

function add_schedule_records_half_term($medoo) {
  if (column_exists($medoo, "schedule_records", "half_term")) {
    return;
  }

  $sql = "ALTER TABLE schedule_records
      ADD COLUMN half_term INT;";
  $medoo->query($sql);
  echo get_db_error2($medoo);
  echo $medoo->last_query(). "<br>\n";
}

function change_schedule_records_timestamp($medoo) {
  $sql = "ALTER TABLE schedule_records
      MODIFY ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;";
  $medoo->query($sql);
  echo $medoo->last_query(). "<br>\n";
}

function add_classes_district($medoo) {
  if (column_exists($medoo, "classes", "district")) {
    return;
  }

  $sql = "ALTER TABLE classes
      ADD COLUMN district MEDIUMINT,
      ADD FOREIGN KEY fk_district(district)
          REFERENCES districts(id);";

  $medoo->query($sql);
  echo get_db_error2($medoo);
  echo $medoo->last_query(). "<br>\n";
}

function add_task_dep2($medoo) {
  if (column_exists($medoo, "tasks", "dep2")) {
    return;
  }

  $sql = "ALTER TABLE tasks
      ADD COLUMN dep2 TINYINT,
      ADD FOREIGN KEY fk_dep2(dep2)
          REFERENCES departments(id);";

  $medoo->query($sql);
  echo get_db_error2($medoo);
  echo $medoo->last_query(). "<br>\n";

  $medoo->update2("tasks", ["dep2" => 1], ["id" => 3]);
}

function update_disctrict_inspector_perm($medoo) {
  $updated = $medoo->update2("users", ["permission" => 0x47],
      ["permission" => 0x43]);
  echo "updated: ". $updated. ":". $medoo->last_query(). "<br>\n";
}

function clean_graduated_admins($medoo) {
  $excludedClassId = get_excluded_classes($medoo);
  $updated = $medoo->update2("users", ["permission" => 3],
      ["AND" => ["permission[!]" => 3, "classId" => $excludedClassId]]);
  echo $medoo->last_query(). " removed ". $updated.
      " admins from deleted/graduated/quit classes.<br>\n";
}

function add_custom_course_groups($medoo) {
  if (table_exists($medoo, "custom_course_groups")) {
    echo "custom_course_groups table exists, doing nothing<br>";
    return;
  }

  $sql = "CREATE TABLE custom_course_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_group INT NOT NULL,
        FOREIGN KEY (course_group) REFERENCES course_groups(id),
    course INT NOT NULL,
        FOREIGN KEY (course) REFERENCES courses(id),
    UNIQUE(course_group, course)
    );";
  $medoo->query($sql);
}

add_district_cfo($medoo);
add_teacher_for_schedules($medoo);
add_shipping_donation_for_orders($medoo);
create_inventory_tables($medoo);
create_org_tables($medoo);
add_staff_columns($medoo);
add_zb_name_for_courses($medoo);
add_task_records_half_term($medoo);
change_task_records_timestamp($medoo);
add_schedule_records_half_term($medoo);
change_schedule_records_timestamp($medoo);
add_classes_district($medoo);
add_task_dep2($medoo);
update_disctrict_inspector_perm($medoo);
clean_graduated_admins($medoo);
?>
</html>
