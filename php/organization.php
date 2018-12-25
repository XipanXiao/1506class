<?php
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";

$medoo = get_medoo();

function create_org_tables() {
  global $medoo;
    
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

$response = null;

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
}

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
  create_org_tables();
  $resource_id = $_GET["rid"];
  if ($resource_id == "organizations") {
    $response = keyed_by_id($medoo->select("organizations", "*"));
  } elseif ($resource_id == "staff") {
    $filter = empty($_GET["user"]) ? null : ["user" => $_GET["user"]];
    $response = $medoo->select("staff", "*", $filter);
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
  create_org_tables();
  $resource_id = $_POST["rid"];
  unset($_POST["rid"]);

  if ($resource_id == "organizations") {
  } elseif ($resource_id == "staff") {
    if ($user->id == $_POST["user"] || isAdmin($user)) {
      $data = build_update_data(["id", "user", "manager", "organization", 
          "start_time", "manager_name"], $_POST);
      $response = ["updated" => insertOrUpdate($medoo, "staff", $data)];
    } else {
      $response = permission_denied_error();
    }
  }
} elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE" &&
    isset ( $_REQUEST["rid"] )) {
  $resource_id = $_REQUEST["rid"];
  $id = $_REQUEST["id"];

  $record = get_single_record($medoo, $resource_id, $id);
  error_log($user->email ." DELETE ". json_encode($record));

  if (empty($record)) return;
  if ($resource_id == "staff") {
    if ($user->id == $_POST["user"] || isAdmin($user)) {
      $response = ["deleted" => $medoo->delete("staff",
          ["id" => $_POST["id"]])];
    }
  }
}

if (is_array($response) && empty($response)) {
  echo '[]';
  return;
}

if ($response) {
  if (is_array($response) && isset($response["updated"]) &&
      intval($response["updated"]) == 0) {
        $response["error"] = get_db_error2($medoo) . $medoo->last_query();
      }

  echo json_encode($response);
}
?>
