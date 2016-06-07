<?php
include_once 'config.php';
include_once "datatype.php";
include_once 'permission.php';

if (!function_exists('http_parse_cookies')) {
    function http_parse_cookies($raw_headers) {
      preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $raw_headers, $matches);

      $cookies = array();
      foreach($matches[1] as $item) {
        parse_str($item, $cookie);
        $cookies = array_merge($cookies, $cookie);
      }
      
      return $cookies;
    }
}

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
  if (!isAdmin($user) && !isClassLeader($user, $user->classId)) {
    echo '{"error": "permission denied"}';
    return;
  }
}

try {
	$ch = curl_init();

  if (FALSE === $ch)
    throw new Exception('failed to initialize');

  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_HEADER, 1);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  
  // All cookies with name like 'PROXY_xx' are from the proxied server.
  $proxy_prefix = "PROXY_";
    
  $cookie_str = "";
  foreach ($_COOKIE as $key => $value) {
  	//error_log("checking cookie: " . $key);
  	 
  	if (strpos($key, $proxy_prefix) !== 0) continue;
    $cookie_str =
        $cookie_str . substr($key, strlen($proxy_prefix)) . "=" . $value . ";";
  }
  //error_log("passing cookie: " . $cookie_str);
  curl_setopt($ch, CURLOPT_COOKIE, $cookie_str);

  $url = null;
  if ($_SERVER ["REQUEST_METHOD"] == "GET") {
    $url = $_GET['url'];
    //error_log("requesting method: " . 'GET');
  } else if ($_SERVER ["REQUEST_METHOD"] == "POST") {
  	$url = $_POST['url'];
    curl_setopt($ch, CURLOPT_POST, 1);
  	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($_POST));
    //error_log("requesting method: " . 'POST');
    //error_log("posting data: " . http_build_query($_POST));
  } elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE") {
  }

  if (!$url) {
  	curl_close($ch);
  	exit();
  }

  //error_log("requesting url: " . $url);
  curl_setopt($ch, CURLOPT_URL, $url);
  
  $response = curl_exec($ch);

  // Parse header to get cookies.
  $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
  curl_close($ch);

  $header = substr($response, 0, $header_size);
  $body = substr($response, $header_size);
  
  $cookies = http_parse_cookies($header);
  //error_log('responding header: ' . $header);

  // Pass cookies to the client with a 'PROXY_' prefix in their name.
  foreach ($cookies as $key => $value) {
  	setcookie('PROXY_' . $key, $value);
  }
  
  echo $body;
} catch(Exception $e) {

  echo sprintf(
      'Curl failed with error #%d: %s',
      $e->getCode(), $e->getMessage());
}
?>
