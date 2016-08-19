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
      $user->classInfo["start_year"] == $classInfo["start_year"] &&
      checkDepartmentLevel($user, $classInfo);
}

function checkDepartmentLevel($user, $classInfo) {
  $user_dep_id = $user->classInfo["department_id"];
  $target_dep_id = $classInfo["department_id"];

  if ($user_dep_id == $target_dep_id) return true;

  $departments = get_departments(); 
  $user_dep = $departments[$user_dep_id];
  $target_dep = $departments[$target_dep_id];
  
  return $user_dep["level"] == $target_dep["level"];
}

?>
