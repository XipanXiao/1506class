<?php
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";

$medoo = get_medoo();

function create_election_tables() {
  global $medoo;
  
  // $medoo->query("drop table votes");
  // $medoo->query("drop table candidates");
  // $medoo->query("drop table elections");
  
  $sql = "CREATE TABLE elections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organizer INT,
        FOREIGN KEY (organizer) REFERENCES users(id),
      start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      global TINYINT(1) NOT NULL DEFAULT 0,
      name VARCHAR(32) CHARACTER SET utf8,
      description VARCHAR(256) CHARACTER SET utf8,
      token INT NOT NULL
    );";
  $medoo->query($sql);
  
  $sql = "CREATE TABLE candidates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      election INT NOT NULL,
        FOREIGN KEY (election) REFERENCES elections(id),
      user INT NOT NULL,
        FOREIGN KEY (user) REFERENCES users(id),
      name VARCHAR(32) CHARACTER SET utf8 NOT NULL,
  		district MEDIUMINT NOT NULL,
        FOREIGN KEY (district) REFERENCES districts(id),
      profile VARCHAR(256) CHARACTER SET utf8,
        UNIQUE KEY `unique_index` (`election`,`user`),
      slogan VARCHAR(64) CHARACTER SET utf8,
      description VARCHAR(1024) CHARACTER SET utf8
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
  $elections = $medoo->select("elections", ["id", "organizer", 
      "start_time", "end_time", "global", "name", "description"]);
  foreach ($elections as $index => $election) {
    $organizer = get_single_record($medoo, "users", $election["organizer"]);
    if (!$organizer) continue;

    $election["organizer_name"] = $organizer["name"];
    $election["organizer_email"] = $organizer["email"];
    $elections[$index] = $election;
  }
  return $elections;
}

function update_election($election) {
  global $medoo;
  create_election_tables();
  $election = build_update_data(["id", "name", "description",
      "start_time", "end_time", "organizer", "global"], $election);
  if (!$election["id"]) {
    $election["token"] = rand(100, 100000000);
  }
  $id = insertOrUpdate($medoo, "elections", $election);
  return get_single_record($medoo, "elections", $id);
}

function delete_election($id) {
  global $medoo;
  return delete_record($medoo, "elections", $id);
}

function get_candidates($election, $district = null) {
  global $medoo;
  if (!$district) {
    return $medoo->select("candidates", "*", ["election" => $election]);
  } else {
    return $medoo->select("candidates", "*",
        ["AND" => ["election" => $election, "district" => $district]]);
  }
}

function update_candidate($candidate) {
  global $medoo;
  $candidate = build_update_data(["id", "election", "user",
      "profile", "slogan", "description"], $candidate);
  if (empty($candidate["id"])) {
    $user = get_single_record($medoo, "users", $candidate["user"]);
    $candidate["district"] = $user["district"];
    $candidate["name"] = $user["name"].
        ($user["nickname"] ? ('(' . $user["nickname"]. ')') : '');
  }
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
  $voted = $medoo->count("votes", ["AND" => [
  	"election" => $vote["election"],
  	"user" => $vote["user"]
  ]]);
  if ($voted >= 3) return 0;
  return $medoo->insert("votes", 
      build_update_data(["election", "user", "candidate"], $vote));
}

function get_vote_users($election_id, $district) {
  global $medoo;
  $election = get_single_record($medoo, "elections", $election_id);
  $users = $medoo->select("users", ["id", "name", "email"],
      ["district" => $district]);
  foreach ($users as $index => $user) {
    $user["token"] = generate_token($user["id"], $election["token"]);
    $users[$index] = $user;
  }
  return $users;
}

function is_voting_from_email() {
  return $_SERVER ["REQUEST_METHOD"] == "GET" &&
      $_GET ["rid"] == "email_vote";
}

$response = null;

if (!is_voting_from_email()) {
  if (empty($_SESSION["user"])) {
    echo '{"error": "login needed"}';
    exit();
  } else {
    $user = unserialize($_SESSION["user"]);
  }
}

function generate_token($user_id, $election_token) {
  return md5("". $user_id. $election_token);
}

function check_and_vote($data, $user_district) {
  global $medoo;
  $candidate = get_single_record($medoo, "candidates", $data["candidate"]);
  if ($candidate && 
      $user_district == $candidate["district"] && 
      $data["election"] == $candidate["election"]) {
    $updated = vote($data);
    return $updated ? ["updated" => $updated, "status" => "success"]
        : ["error" => "only 3 votes please"];
  } else {
    return ["error" => "only vote a candidate from the same district"];
  }
}

function is_election_owner($election_id) {
  global $medoo;
  global $user;

  if (isCountryAdmin($user)) return true;
  $election = get_single_record($medoo, "elections", $election_id);
  if (!$election) return false;
  return intval($election["organizer"]) == $user->id;
}

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
  $resource_id = $_GET["rid"];
  if ($resource_id == "elections") {
    $response = get_elections();
  } else if ($resource_id == "candidates") {
    $election = $_GET["election"];
    $district = $_GET["district"];
    if (is_election_owner($election) || 
        $district && $district == $user->district) {
      $response = get_candidates($election, $district);
    } else {
      $response = permission_denied_error();
    }
  } elseif ($resource_id == "votes") {
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
  } elseif ($resource_id == "users") {
    $election_id = $_GET["election"];
    $response = is_election_owner($election_id)
        ? get_vote_users($election_id, $_GET["district"])
        : permission_denied_error();
  } elseif ($resource_id == "email_vote") {
    $election = get_single_record($medoo, "elections",  $_GET["election"]);
    if ($election) {
      $user = get_single_record($medoo, "users", $_GET["user"]);
      $response = generate_token($_GET["user"], $election["token"]) == $_GET["token"]
          ? check_and_vote($_GET, $user["district"])
          : permission_denied_error();
    } else {
      $response = ['error' => 'missing election id'];
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
    $response = check_and_vote($_POST);
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
        ? ["deleted" => delete_election($id)]
        : permission_denied_error();
  } else if ($resource_id == "candidates") {
    $response = is_election_owner($record["election"])
        ? ["deleted" => delete_candidate($id)]
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
        $response["error"] = get_db_error2($medoo) . $medoo->last_query();
      }

  echo json_encode($response);
}
?>
