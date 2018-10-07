<?php
/// 订书模块
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";

$medoo = get_medoo();

function create_election_tables() {
  global $medoo;
  
  $sql = "CREATE TABLE elections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organizer INT,
        FOREIGN KEY (organizer) REFERENCES users(id),
      start DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      end DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      global TINYINT(1) NOT NULL DEFAULT 0,
      name VARCHAR(32) CHARACTER SET utf8,
      description VARCHAR(256) CHARACTER SET utf8
    );";
  if (!$medoo->query($sql)) return;

  $medoo->insert("elections", ["id" => 1, "organizer" => 53]);
  
  $sql = "CREATE TABLE candidates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      election INT NOT NULL,
        FOREIGN KEY (election) REFERENCES elections(id),
      user INT NOT NULL,
        FOREIGN KEY (user) REFERENCES users(id),
      profile VARCHAR(256) CHARACTER SET utf8,
      UNIQUE KEY `unique_index` (`election`,`user`),
      description VARCHAR(256) CHARACTER SET utf8
    );";

  $medoo->query($sql);
  
  $sql = "CREATE TABLE votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      election INT NOT NULL,
        FOREIGN KEY (election) REFERENCES elections(id),
      user INT NOT NULL,
        FOREIGN KEY (user) REFERENCES users(id),
      candidate INT NOT NULL,
        FOREIGN KEY (candidate) REFERENCES candidates(id),
      UNIQUE KEY `unique_index` (`election`,`user`, `candidate`),
      ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );";

  $medoo->query($sql);
}

function get_elections() {
  global $medoo;
  create_election_tables();
  return $medoo->select("elections", "*");
}

function update_election($election) {
  global $medoo;
  create_election_tables();
  return insertOrUpdate($medoo, "elections", $election);
}

function delete_election($id) {
  global $medoo;
  return delete_record($medoo, "elections", $id);
}

function get_candidates($election) {
  global $medoo;
  return $medoo->select("candidates", "*", ["election" => $election]);
}

function update_candidate($candidate) {
  global $medoo;
  return insertOrUpdate($medoo, "candidates", $candidate);
}

function delete_candidate($id) {
  global $medoo;
  return delete_record($medoo, "candidates", $id);
}

function get_votes($election, $user_id = NULL) {
  global $medoo;
  if (empty($user_id)) {
    return $medoo->select("votes", "*", ["election" => $election]);
  } else {
    return $medoo->select("votes", "*", 
        ["AND" => ["election" => $election, "user" => $user_id]]);
  }
}

function vote($vote) {
  global $medoo;
  return $medoo->insert("votes", $vote);
}

$response = null;

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
}

function is_election_owner($election_id) {
  global $medoo;
  if (isSysAdmin($user)) return TRUE;
  $election = get_single_record($medoo, "elections", $election_id);
  if (!$election) return FALSE;
  return intval($election["organizer"]) == $user->id;
}

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
  $resource_id = $_GET["rid"];
  if ($resource_id == "elections") {
    $response = get_elections();
  } else if ($resource_id == "candidates") {
    $response = get_candidates($_GET["election"]);
  } else if ($resource_id == "votes") {
    $election_id = $_GET["election"];
    // Get all votes
    if (empty($_GET["user"])) {
      $response = is_election_owner($election_id)
          ? get_votes($election_id)
          : permission_denied_error();
    } else {
      $response = $user->id == intval($_GET["user"]) ||
          is_election_owner($election_id) 
          ? get_votes($_GET["election"], $_GET["user"])
          : permission_denied_error();
    }
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
  $resource_id = $_POST["rid"];
  unset($_POST["rid"]);
  
  if ($resource_id == "elections") {
    $response = is_election_owner($_POST["id"]) 
        ? ["updated" => update_election($_POST)] 
        : permission_denied_error();
  } else if ($resource_id == "candidates") {
    $response = is_election_owner($_POST["election"])
        ? ["updated" => update_candidate($_POST)]
        : permission_denied_error();
  } else if ($resource_id == "votes") {
    $response = ["updated" => vote($_POST)];
  }
} elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE" &&
    isset ( $_REQUEST["rid"] )) {

  $resource_id = $_REQUEST["rid"];
  $id = $_REQUEST["id"];

  $record = get_single_record($medoo, $resource_id, $id);
  error_log($user->email ." DELETE ". json_encode($record));
  
  if (empty($record)) return;
  
  if ($resource_id == "elections") {
    $response = is_election_owner($id)
        ? ["updated" => delete_election($id)]
        : permission_denied_error();
  } else if ($resource_id == "candidates") {
    $response = is_election_owner($record["election"])
        ? ["updated" => delete_candidate($id)]
        : permission_denied_error();
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
