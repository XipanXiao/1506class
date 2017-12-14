<?php
define("TEACHER", 0x403);
define("INSPECTOR", 0x57);

function isSysAdmin($user) {
  return ($user->permission & 0xFFFF) == 0xFFFF;
}

function isInspector($user) {
  return ($user->permission & INSPECTOR) == INSPECTOR;	
}

function isYearLeader($user) {
  return ($user->permission & 0x3F) == 0x3F;
}

function isClassLeader($user, $classId) {
  return ($user->permission & 0xF) == 0xF && $user->classId == $classId;
}

function isAdmin($user) {
  return $user->permission > get_student_permission();
}

function isOrderManager($user) {
  return ($user->permission & 0x103) == 0x103;
}

function canGrant($user, $perm) {
  return ($user->permission & $perm) == $perm;	
}

function canReadOrderAddress($user) {
  return ($user->permission & 0x303) == 0x303;
}

function get_student_permission() {
  return 3;
}

function is_teacher($user) {
  return ($user->permission & TEACHER) == TEACHER;
}

function is_teacher_of($user, $classInfo) {
  return is_teacher($user) && 
      intval($classInfo["teacher_id"]) == $user->id;
}

function canRead($user, $classInfo) {
  if (isSysAdmin($user) || isInspector($user)) return true;

  $level = $classInfo["perm_level"];
  if (!$level || is_teacher_of($user, $classInfo)) {
    return true;
  }

  $perm = ($user->permission >> (($level - 1) * 2)) & 1;
  if (!$perm) return false;
  
  return checkClass($user, $classInfo) || checkYear($user, $classInfo);
}

function canWrite($user, $classInfo) {
  if (isSysAdmin($user)) return true;

  $level = $classInfo["perm_level"];
  if (!$level) return true;
  
  $perm = ($user->permission >> (($level - 1) * 2)) & 2;
  if (!$perm) return false;

  return checkClass($user, $classInfo) || checkYear($user, $classInfo);
}

function checkClass($user, $classInfo) {
  return isClassLeader($user, $classInfo["id"]);
}

function checkYear($user, $classInfo) {
  return isYearLeader($user) &&
      $user->classInfo["start_year"] == $classInfo["start_year"];
}

function getStartPage($user) {
  if (isSysAdmin($user)) return "admin.html";
  if (isOrderManager($user)) return "order_admin.html";
  if (isAdmin($user)) return "admin.html";
  return "index.html";
}

abstract class Roles {
  const SYS_ADMIN = 0xFFFF;
  const YEAR_LEADER = 0x3F;
  const CLASS_LEADER = 0xF;
}
?>
