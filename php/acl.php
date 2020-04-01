<?php
function inWhiteList($email) {
  $access_white_list = ["qiqi0502@gmail.com"];
  return in_array($email, access_white_list);
}
?>
