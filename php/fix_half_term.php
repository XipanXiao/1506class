<html>
<head>
<meta charset="UTF-8">
</head>
<body>
<?php
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
  if (!isSysAdmin($user) || $user->id != 66) exit();
}

$verified = 0;
$medoo = get_medoo();
$formatStr = "Y-m-d H:i:s";

function strToDateTime($str) {
  global $formatStr;
  return date_create_from_format($formatStr, $str);
}

date_default_timezone_set('UTC');

function roundToDefaultStartTime($date) {
  $month = abs(date("m", $date) - 6) <= 2 ? 6 : 12;
  $year = date("Y", $date);
  $day = date("d", $date);
  $date = new DateTime();
  $date->setDate($year, $month, $day);
  $date->setTime(0, 0, 0);
  return $date;
}

function offsetHalfYear($date, $operator = "+") {
  $date->modify($operator. "6 month");
  return $date;
}

function get_course_ids($schedule) {
  $ids = [];
  if (!empty($schedule["course_id"])) {
    array_push($ids, intval($schedule["course_id"]));
  }
  if (!empty($schedule["course_id2"])) {
    array_push($ids, intval($schedule["course_id2"]));
  }
  return $ids;
}

function vacation($schedule) {
  return empty($schedule["course_id"]) && empty($schedule["course_id2"]);
}

function printTermCourses($group) {
  global $medoo;

  echo sprintf("Term: %d<br>\n", $group["term"]);
  $names = $medoo->select("courses", "name", ["id" => $group["first_half"]]);
  if (!empty($names)) {
    echo sprintf("first half: %s<br>\n", join(",", $names));
  }
  $names = $medoo->select("courses", "name", ["id" => $group["second_half"]]);
  if (!empty($names)) {
    echo sprintf("second half: %s<br>\n", join(",", $names));
  }
}

function prepare_middle_week($group) {
  global $medoo;
  $schedules = $medoo->select("schedules", "*", ["group_id" => $group["id"]]);

  $vacations = array_filter($schedules, "vacation");
  $total = count($schedules);
  $effective = $total - count($vacations);
  $middle = empty($group["mid_week"]) 
      ? ($effective / 2 + 1)
      : intval($group["mid_week"]);

  $i = 0;
  $group["first_half"] = [];
  $group["second_half"] = [];
  foreach($schedules as $schedule) {
    $ids = get_course_ids($schedule);
    if (count($ids) == 0) continue;

    if (++$i <= $middle) {
      $group["first_half"] = array_merge($group["first_half"], $ids);
    } else {
      $group["second_half"] = array_merge($group["second_half"], $ids);
    }
  }
  // printTermCourses($group);
  return $group;
}

function prepareEndTime($groups) {
  global $formatStr;

  foreach($groups as $term => $group) {
    if (!empty($group["end_time"]) && strToDateTime($group["end_time"])) {
      continue;
    }

    $endTime = null;

    $previous = empty($groups[$term - 1]) ? null : $groups[$term - 1];
    $nextGroup = empty($groups[$term + 1]) ? null : $groups[$term + 1];

    if ($date = strToDateTime($group["start_time"])) {
      $endTime = offsetHalfYear($date);
    } else if ($previous && $date = strToDateTime($previous["end_time"])) {
      $endTime = offsetHalfYear($date);
    } else if ($nextGroup && $date = strToDateTime($nextGroup["start_time"])) {
      $endTime = $date;
    } else if ($nextGroup && $date = strToDateTime($nextGroup["end_time"])) {
      $endTime = offsetHalfYear($date, "-");
    }

    $group["end_time"] = $endTime ? $endTime->format($formatStr) : NULL;
    $groups[$term] = $group;
  }
  return $groups;
}

function verify($student_ids, $startTime, $endTime, $half_term) {
  global $medoo;
  global $verified;

  $records = $medoo->select("task_records", ["half_term"],
      ["AND" => [
        "half_term[!]" => NULL,
        "ts[<>]" => [$startTime, $endTime],
        "student_id" => $student_ids
      ]]);
  if (empty($records)) return;
  foreach ($records as $record) {
    if (intval($record["half_term"]) == $half_term) $verified++;
  }
}

function set_half_term_for_range($student_ids, $startTime, $endTime, $half_term,
    $dryrun = TRUE) {
  return;
  global $medoo;

  echo sprintf("Setting half_term between [%s, %s] to %d for (%s)<br>\n",
      $startTime, $endTime, $half_term, join(", ", $student_ids));

  if ($dryrun) return;

  // $sql = sprintf("UPDATE task_records SET half_term = %d WHERE
  //     (ts BETWEEN '%s' AND '%s') AND
  //     student_id in (%s)",
  //     $half_term, 
  //     $startTime, $endTime,
  //     implode(",", $student_ids)
  //   );

  // $result = $medoo->query($sql);
  // $updated = $result ? $result->fetchAll() : 0;

  $updated = $medoo->update("task_records", ["half_term" => $half_term],
      ["AND" => [
        "half_term" => NULL,
        "ts[<>]" => [$startTime, $endTime],
        "student_id" => $student_ids
      ]]);
  echo sprintf("%s<br>\n. Updated %d records<br>\n",
      $medoo->last_query(), $updated);
  return $updated;
}

function getTermMiddle($group) {
  global $formatStr;

  $start = strToDateTime($group["start_time"]);
  $weeks = intval($group["mid_week"]);
  if (!$weeks) {
    $weeks = 12;
  }
  $start->modify("+". $weeks. " weeks");
  return $start->format($formatStr);
}

function getTermStart($groups, $term) {
  $previous = empty($groups[$term - 1]) ? null : $groups[$term - 1];
  return $previous ? $previous["end_time"] : "1970-01-01 00:00:00";
}

function getTermEnd($groups, $term) {
  global $formatStr;

  $group = $groups[$term];
  $nextGroup = empty($groups[$term + 1]) ? null : $groups[$term + 1];
  return $nextGroup ? $group["end_time"] : date($formatStr);
} 

function set_half_term_for_schedule_tasks($student_ids, $group) {
  global $medoo;

  $half_term = intval($group["term"]) * 2;
  $updated = $medoo->update("schedule_records", 
      ["half_term" => $half_term],
      ["AND" => [
        "half_term" => NULL,
        "course_id" => $group["first_half"],
        "student_id" => $student_ids
      ]]);
  if ($updated) {
      echo sprintf("%s<br>\n. Updated %d records<br>\n",
          $medoo->last_query(), $updated);
  }

  $updated = $medoo->update("schedule_records", 
      ["half_term" => ($half_term == 2 ? 2 : ($half_term + 1))],
      ["AND" => [
        "half_term" => NULL,
        "course_id" => $group["second_half"],
        "student_id" => $student_ids
      ]]);
  if ($updated) {
      echo sprintf("%s<br>\n. Updated %d records<br>\n",
          $medoo->last_query(), $updated);
  }
}

function fix_half_term_for_terms($classId, $groups) {
  global $medoo;

  $classInfo = current($medoo->select("classes", ["name"], ["id" => $classId]));
  echo sprintf("<br>\n========Fixing class: %d (%s) <br>\n", 
      $classId, $classInfo["name"]);

  $student_ids = $medoo->select("users", "id", ["classId" => $classId]);
  if (empty($student_ids)) {
    echo "No student for class ". $classId. "<br>\n";
    return;
  }

  foreach($groups as $term => $group) {
    $startTime = getTermStart($groups, $term);
    $endTime = getTermEnd($groups, $term);
    $midTime = getTermMiddle($group);

    if ($term <= 1) {
      set_half_term_for_range($student_ids, $startTime, $endTime,
          2, FALSE);
    } else {
      set_half_term_for_range($student_ids, $startTime, $midTime,
          $term * 2, FALSE);
      set_half_term_for_range($student_ids, $midTime, $endTime,
          $term * 2 + 1, FALSE);
    }
    set_half_term_for_schedule_tasks($student_ids, $group);
  }
}

function printTerms($classId, $groups) {
  global $formatStr;

  echo "<br>\n";
  echo "<br>\n";
  echo "<br>\n";
  echo "================". $classId. "<br>\n";
  foreach($groups as $group) {
    $midTime = getTermMiddle($group);
    echo "term: ". $group["term"]. ", start: ". $group["start_time"]. ", end time: ". $group["end_time"]. " (". $midTime. ")<br>\n";
  }
  echo "================". $classId. " done!<br>\n";
}

function fix_half_term($classId) {
  global $medoo;

  $groups = $medoo->select("schedule_groups", "*",
      ["classId" => $classId, "ORDER" => "term"]);

  $terms = [];
  foreach($groups as $group) {
    $term = intval($group["term"]);
    if (!empty($terms[$term])) continue;
    $terms[$term] = $group;
  }

  $terms = prepareEndTime($terms);
  $terms = array_map("prepare_middle_week", $terms);
  fix_half_term_for_terms($classId, $terms);
}

function fix_all_classes() {
  global $medoo;
  global $verified;

  $classIds = $medoo->select("classes", "id");
  foreach($classIds as $classId) {
    fix_half_term($classId);
  }
  // echo sprintf("verified %d records<br>\n", $verified);
}

fix_all_classes();
?>
</body>
</html>
