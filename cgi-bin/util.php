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
?>
