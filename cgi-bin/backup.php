<?php

function try_backup() {
  $dir = getenv("HOME") . "/app-root/data";

  date_default_timezone_set("UTC");
  $filename = $dir . "/buddcourses_" . date("w") . ".sql";
  
  if (file_exists($filename)) {
    $timestamp = filemtime($filename);
    if (time() - $timestamp < 3600*24) return null;
  }
  
  $command = "mysqldump -u $OPENSHIFT_MYSQL_DB_USERNAME ". 
      "-h $OPENSHIFT_MYSQL_DB_HOST -p $OPENSHIFT_MYSQL_DB_PASSWORD ". 
      "buddcourses --default-character-set=utf8 --result-file=".
      $filename;
  return exec($command);
}
?>
