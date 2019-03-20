<?php
function isSysAdmin($user) {
  return ($user->permission & Roles::SYS_ADMIN) == Roles::SYS_ADMIN;
}

function isCountryAdmin($user) {
  return ($user->permission & Roles::COUNTRY_ADMIN) == Roles::COUNTRY_ADMIN;
}

function isDistrictInspector($user) {
  return ($user->permission & Roles::DISTRICT_INSPECTOR) ==
      Roles::DISTRICT_INSPECTOR;
}

function isInspector($user) {
  return ($user->permission & Roles::COUNTRY_INSPECTOR) ==
      Roles::COUNTRY_INSPECTOR;
}

function isYearLeader($user) {
  return ($user->permission & Roles::YEAR_LEADER) == Roles::YEAR_LEADER;
}

function isClassLeader($user, $classId) {
  return ($user->permission & Roles::CLASS_LEADER) == Roles::CLASS_LEADER &&
      $user->classId == $classId;
}

function isClassReader($user, $classId) {
  return ($user->permission & Roles::CLASS_READER) == Roles::CLASS_READER &&
      $user->classId == $classId;
}

function isAdmin($user) {
  return ($user->permission & Roles::CLASS_LEADER) == Roles::CLASS_LEADER;
}

function isOrderReader($user) {
  return ($user->permission & Roles::ORDER_INSPECTOR) ==
      Roles::ORDER_INSPECTOR;
}

function isOrderManager($user) {
  return ($user->permission & Roles::ORDER_ADMIN) ==
      Roles::ORDER_ADMIN;
}

function canWriteOrder($user, $order) {
  return isOrderManager($user) ||
    $user->id == $order["user_id"] ||
    isDistrictInspector($user) && $user->district == $order["district"];
}

function canGrant($user, $perm) {
  return ($user->permission & $perm) == $perm;
}

function canReadOrderAddress($user) {
  return isOrderManager($user) || isDistrictInspector($user);
}

function get_student_permission() {
  return Roles::STUDENT;
}

function sameCountry($user, $classInfo) {
  return true;
  // Class with id 1 is visible to every country, new registered students are
  // put here.
  // return $user->country == $classInfo["country"] || isNewClass($classInfo);
}

function isNewClass($classInfo) {
  return intval($classInfo["id"]) == 1;
}

function is_teacher_of($user, $classInfo) {
  return intval($classInfo["teacher_id"]) == $user->id ||
      intval($classInfo["teacher2_id"]) == $user->id;
}

function canRead($user, $classInfo) {
  $level = $classInfo["perm_level"];
  if (!$level || is_teacher_of($user, $classInfo)) {
    return true;
  }

  $perm = ($user->permission >> (($level - 1) * 2)) & 1;
  if (!$perm) return false;

  return checkClass($user, $classInfo) || checkYear($user, $classInfo) ||
      isInspector($user) || isCountryAdmin($user) || isSysAdmin($user);
}

function canWrite($user, $classInfo) {
  $level = $classInfo["perm_level"];
  if (!$level) return true;

  $perm = ($user->permission >> (($level - 1) * 2)) & 2;
  if (!$perm) return false;

  return checkClass($user, $classInfo) ||
      checkYear($user, $classInfo) ||
      isCountryAdmin($user) ||
      isSysAdmin($user);
}

function checkClass($user, $classInfo) {
  return isClassLeader($user, $classInfo["id"]);
}

function checkYear($user, $classInfo) {
  return isYearLeader($user) &&
      sameCountry($user, $classInfo) &&
      $user->classInfo["start_year"] == $classInfo["start_year"];
}

function getStartPage($user) {
  if (isCountryAdmin($user)) return "admin.html";
  if (isOrderManager($user)) return "order_admin.html";
  if (isAdmin($user)) return "admin.html";
  return "index.html";
}

function canReadDistrict($user, $district_id) {
  return isSysAdmin($user) ||
      isInspector($user) ||
      isDistrictInspector($user) && $user->district == $district_id;
}

abstract class Roles {
  const SYS_ADMIN = 0xFFFF;
  const COUNTRY_ADMIN = 0xFFF;
  const COUNTRY_INSPECTOR = 0x457;
  const ORDER_ADMIN = 0x303;
  const ORDER_INSPECTOR = 0x103;
  const DISTRICT_INSPECTOR = 0x43;
  const YEAR_LEADER = 0x3F;
  const CLASS_LEADER = 0xF;
  const CLASS_READER = 0x7;
  const STUDENT = 0x3;
}
?>
