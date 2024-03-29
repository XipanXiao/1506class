<?php
include_once 'connection.php';

function is_merit_assoc_only($user) {
  $key = 'merit_assc';
  return array_key_exists($key, $user) && intval($user[$key]) == 1;
}

/// 如果注册为功德会成员，设置相应的bit.
function set_assoc_only_bit($user) {
  if (is_merit_assoc_only($user)) {
    $user['enroll_tasks'] = (1 << 8);
  }
  return $user;
}
?>
