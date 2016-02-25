<?php
function isSysAdmin($user) {
  return ($user->permission & 0xFF) == 0xFF;
}

function isClassLeader($user, $classId) {
  return ($user->permission & 0xF) == 0xF && $user->classId == $classId;
}

function isAdmin($user) {
  return $user->permission > 7 && ($user->permission & 7) == 7;
}
?>
