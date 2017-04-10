<?php
function isSysAdmin($user) {
  return ($user->permission & 0xFF) == 0xFF;
}

function isYearLeader($user) {
  return ($user->permission & 0x3F) == 0x3F;
}

function isClassLeader($user, $classId) {
  return ($user->permission & 0xF) == 0xF && $user->classId == $classId;
}

function isAdmin($user) {
  return $user->permission > 7 && ($user->permission & 7) == 7;
}

function isOrderManager($user) {
  return ($user->permission & 0x107) == 0x107;
}

function canRead($user, $classInfo) {
  if (isSysAdmin($user)) return true;

  $level = $classInfo["perm_level"];
  if (intval($classInfo["teacher_id"]) == $user->id || !$level) {
    return true;
  }

  $perm = $user->permission >> (($level - 1) * 2);
  if (!$perm) return false;
  
  return checkClass($user, $classInfo) || checkYear($user, $classInfo);
}

function canWrite($user, $classInfo) {
  if (isSysAdmin($user)) return true;

  $level = $classInfo["perm_level"];
  if (intval($classInfo["teacher_id"]) == $user->id || !$level) {
    return true;
  }
  
  $perm = $user->permission >> (($level - 1) * 2);
  if (!($perm & 2)) return false;
  
  return checkClass($user, $classInfo) || checkYear($user, $classInfo);
}

function checkClass($user, $classInfo) {
  return $user->permission >= 0xF &&
      $user->classInfo["id"] == $classInfo["id"];
}

function checkYear($user, $classInfo) {
  return $user->permission >= 0x3F &&
      $user->classInfo["start_year"] == $classInfo["start_year"];
}
?>
