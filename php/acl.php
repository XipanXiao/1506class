<?php
function in_white_list($email) {
  $access_white_list = ["qiqi0502@gmail.com"];
  return in_array($email, $access_white_list);
}
?>
