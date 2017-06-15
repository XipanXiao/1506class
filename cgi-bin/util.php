<?php
// The header function needs to be called before anything else is echoed back.
function client_redirect($url, $delay, $message = "") {
  echo sprintf("<html>
      <head>
        <meta http-equiv=\"refresh\" content=\"%d; url=%s\"/>
      </head>
      <body style=\"margin-left: auto; margin-right: auto; width: 400px\">
        <p >%s</p>
      </body>
    </html>", $delay, $url, $message);
}

/// Returns true if the [$table] exists in the database.
function table_exists($medoo, $table) {
  $result = $medoo->query("SELECT 1 FROM ". $table. " LIMIT 1");
  return !empty($result);
}

function permision_denied_error() {
  return ["error" => "permission denied"];
}

function get_db_error2($medoo) {
  $errors = $medoo->error();
  return empty($errors) ? '' : $errors[2];
}

function keyed_by_id($rows, $id_key = "id") {
  $result = [];

  if (!is_array($rows) || empty($rows)) return $result;

  foreach ($rows as $row) {
    $result[$row[$id_key]] = $row;
  }

  return $result;
}

function build_update_data($fields, $source) {
  $datas = [];
  foreach ($fields as $field) {
    if (isset($source[$field])) {
      $datas[$field] = $source[$field];
    }
  }
  return $datas;
}

function same_address($order1, $order2) {
  return $order1["zipcode"] == $order2["zipcode"] &&
    $order1["street"] == $order2["street"] &&
    $order1["city"] == $order2["city"] &&
    $order1["state"] == $order2["state"] &&
    $order1["country"] == $order2["country"];
}

function is_uppercase($char) {
  return 'A' <= $char && $char <= 'Z';
}

function is_country_code($countryCode) {
  return strlen($countryCode) == 2 && is_uppercase($countryCode[0]) &&
      is_uppercase($countryCode[1]);
}

function is_email_blocked($email) {
  foreach(["sharklasers"] as $blocked) {
    if (strstr(strtolower($email), $blocked)) return true;
  }
  return false;
}

function get_single_record($medoo, $table, $id) {
  $results = $medoo->select($table, "*", ["id" => $id]);
  return empty($results) ? null : current($results);
}
?>
