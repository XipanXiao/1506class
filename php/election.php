<?php
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";

$medoo = get_medoo();

function get_elections() {
  global $medoo;
  $elections = $medoo->select("elections", ["id", "organizer", "max_vote",
      "start_time", "end_time", "global", "name", "description"], [
        "deleted" => 0
      ]);
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
  $election = build_update_data(["id", "name", "description", "deleted",
      "start_time", "end_time", "organizer", "global", "max_vote"], $election);
  if (!$election["id"]) {
    $election["token"] = rand(100, 100000000);
  }
  $id = insertOrUpdate($medoo, "elections", $election);
  if (!$id || !empty($election["deleted"])) return 0;
  $election = get_single_record($medoo, "elections", $id);
  unset($election["token"]);
  return $election;
}

function delete_election($id) {
  global $medoo;
  if (delete_record($medoo, "elections", $id)) return $id;
  update_election(["id" => $id, "deleted" => 1]);
  return $id;
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
  if (!empty($candidate["user"])) {
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
  return $medoo->insert("votes",
      build_update_data(["election", "user", "candidate", "source"], $vote));
}

function delete_vote($id) {
	global $medoo;
  return $medoo->delete("votes", ["id" => $id]);
}

function get_vote_users($election_id, $district) {
  global $medoo;
  $election = get_single_record($medoo, "elections", $election_id);
  if (!$election) return [];

  $users = $medoo->select("users",
      ["id", "name", "email", "classId", "district"],
      empty($district) ? null : ["district" => $district]);
  $classes = keyed_by_id($medoo->select("classes", ["id"],
      ["AND" => [
        "deleted" => 0,
        "graduated" => 0,
        "department_id[!]" => [8, 9]
      ]]));

  $filtered = [];
  foreach ($users as $index => $user) {
    if (!$classes[$user["classId"]]) {
      continue;
    }
    $user["token"] = generate_token($user["id"], $election["token"]);
    array_push($filtered, $user);
  }
  return $filtered;
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

function in_time_range($start_time, $end_time) {
  date_default_timezone_set("America/New_York");
  $current = new DateTime();
  $start = DateTime::createFromFormat('Y-m-d H:i:s', $start_time);
  $end = DateTime::createFromFormat('Y-m-d H:i:s', $end_time);
  return $start <= $current && $current < $end;
}

function check_and_vote($data, $user_district) {
  global $medoo;
  $election = get_single_record($medoo, "elections", $data["election"]);
  if (!in_time_range($election["start_time"], $election["end_time"])) {
    return ["error" => "not an ongoing event"];
  }

  if (empty($data["candidate"])) {
    $voted = $medoo->count("votes", ["AND" => [
      "election" => $data["election"],
      "user" => $data["user"]
    ]]);
    return ["updated" => ($voted ? $voted : vote($data))];
  }

  $candidate = get_single_record($medoo, "candidates", $data["candidate"]);
  if (!$candidate ||
      !intval($election["global"]) && $user_district != $candidate["district"] ||
      $data["election"] != $candidate["election"]) {
    return ["error" => "only vote a candidate from the same district"];
  }

  $voted = $medoo->count("votes", ["AND" => [
    "election" => $data["election"],
    "user" => $data["user"],
    "candidate[!]" => null,
  ]]);
  $max_vote = intval($election["max_vote"]);
  if ($voted >= $max_vote) {
    return ["error" => "only ". $max_vote.  " votes please"];
  }

  $updated = vote($data);
  return $updated ? ["updated" => $updated, "status" => "success"]
    : ["error" => "you already voted for this candidate"];
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
      $election = get_single_record($medoo, "elections", $election);
      $response = intval($election["global"])
          ? get_candidates($election)
          : permission_denied_error();
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
    $election_id = intval($_GET["election"]);
    $response = is_election_owner($election_id)
        ? get_vote_users($election_id, $_GET["district"])
        : permission_denied_error();
  } elseif ($resource_id == "email_vote") {
    $election = get_single_record($medoo, "elections",  $_GET["election"]);
    if ($election) {
      $user = get_single_record($medoo, "users", $_GET["user"]);
      if ($user) {
        $classInfo = get_single_record($medoo, "classes", $user["classId"]);
        $dep = intval($classInfo["department_id"]);
        if ($dep == 8 || $dep == 9) {
          $response = permission_denied_error();
        } else {
          $response = generate_token($_GET["user"], $election["token"]) == $_GET["token"]
              ? check_and_vote($_GET, $user["district"])
              : permission_denied_error();
          if (intval($response["updated"])) {
            if (empty($_GET["img"])) {
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>操作成功</title>
</head>
<body>
操作成功。您可以到<a href="../vote.html">投票页面</a>查看。
</body>
</html>
<?php
              return;
            } else {
              header("Content-type: image/gif");
              readfile("../images/blank.gif");
              return;
            }
          }
        }
      } else {
        $response = ["error" => "invalid user"];
      }
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
    $dep = intval($user->classInfo["department_id"]);
    $response = ($dep == 8 || $dep == 9)
        ? permission_denied_error()
        : check_and_vote($_POST, $user->district);
  }
} elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE" &&
    isset ( $_REQUEST["rid"] )) {

  $resource_id = $_REQUEST["rid"];
  $id = $_REQUEST["id"];

  $record = get_single_record($medoo, $resource_id, $id);
  error_log($user->email ." DELETE ". json_encode($record));

  if (empty($record)) return;

  if ($resource_id == "elections") {
    $response = isCountryAdmin()
        ? ["deleted" => delete_election($id)]
        : permission_denied_error();
  } elseif ($resource_id == "candidates") {
    $response = is_election_owner($record["election"])
        ? ["deleted" => delete_candidate($id)]
        : permission_denied_error();
  } elseif ($resource_id == "votes") {
  	if ($user->id == intval($record["user"])) {
  		$election = get_single_record($medoo, "elections", $record["election"]);
  		if (in_time_range($election["start_time"], $election["end_time"])) {
  			$response = ["deleted" => delete_vote($id)];
  		} else {
        $response = ["error" => "not an ongoing event"];
      }
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
