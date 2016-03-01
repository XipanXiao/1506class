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

// Remove the 'day' part from a birthday string.
function format_birthday($birthday) {
  if (empty($birthday)) return $birthday;

  $parts = explode("-", $birthday);
  $len = count($parts);
  if ($len == 0) return null;
  
  return $len == 1 ? $parts[0] . "-01-00" : $parts[0] . "-" . $parts[1] . "-00";
}
?>
