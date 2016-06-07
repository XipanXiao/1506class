<?php
if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["url"] )) {
  header("Location: ". $_GET["url"]);
  exit();
}
?>
