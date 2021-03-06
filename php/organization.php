<?php
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";

$medoo = get_medoo();

$response = null;

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
}

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
  $resource_id = $_GET["rid"];
  if ($resource_id == "organizations") {
    $response = keyed_by_id($medoo->select("organizations", "*"));
  } elseif ($resource_id == "staff") {
    $filter = empty($_GET["user"]) ? null : ["user" => $_GET["user"]];
    $response = $medoo->select("staff", "*", $filter);
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
  $resource_id = $_POST["rid"];
  unset($_POST["rid"]);

  if ($resource_id == "organizations") {
  } elseif ($resource_id == "staff") {
    if ($user->id == $_POST["user"] || isAdmin($user)) {
      $data = build_update_data(["id", "user", "manager", "organization", 
          "start_time", "manager_name", "title", "free_time"], $_POST);
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
          ["id" => $id])];
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
