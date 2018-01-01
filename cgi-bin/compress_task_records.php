<?php
include_once "datatype.php";
include_once "connection.php";
include_once "permission.php";
include_once "util.php";

$medoo = get_medoo();

function backup_records($task_id) {
  global $medoo;
  
  $table = "task_records";
  $backup = "task_records_backup";

  if (!table_exists($medoo, $backup)) {
    $sql = "
        CREATE TABLE `task_records_backup` (
          `id` int(11) NOT NULL,
          `student_id` int(11) NOT NULL,
          `task_id` mediumint(9) DEFAULT NULL,
          `count` mediumint(9) DEFAULT NULL,
          `duration` smallint(11) DEFAULT NULL,
          `sub_index` tinyint(4) NOT NULL,
          `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`)
        );
        ";
  
    echo $sql. "<BR>\n";
    $medoo->query($sql);
    
    if (!table_exists($medoo, $backup)) {
      echo "Failed to create backup table: ". get_db_error2($medoo);
      return 0;
    }
  }
  
  if (!empty($medoo->select($backup, "*", ["LIMIT" => 1]))) {
  	echo "Backup table is not empty, do nothing<br>\n";
  	return 0;
  }
  
  $sql = sprintf("INSERT INTO %s SELECT * FROM %s WHERE task_id=%d",
      $backup, $table, $task_id);
  echo $sql. "<BR>\n";

  if (!$medoo->query($sql)) {
    echo "Failed to backup: ". get_db_error2($medoo);
    return 0;
  }
  
  $where = ["task_id" => $task_id];
  $rows = $medoo->count($backup, "id");
  if ($medoo->count($table, "id", $where) != $rows) {
    echo "Back up is not complete: ". get_db_error2($medoo);
    return 0;
  }

  echo "Back up completed.<BR>\n";
  return $rows;
}

function delete_records($task_id, $rows = null) {
  global $medoo;
  
  $table = "task_records";
  $where = ["task_id" => $task_id];
  $result = $medoo->delete($table, $where);
  echo $medoo->last_query(). "<BR>\n";
  return ($rows == null || $rows == $result) && 
      $medoo->count($table, "id", $where) == 0; 
}

function aggregate_records($task_id) {
  global $medoo;
  
  $table = "task_records";
  $backup = "task_records_backup";
  
  $sql = sprintf("INSERT INTO %s". 
      " (task_id, student_id, sub_index, count, duration, ts)".
      " SELECT task_id, student_id, sub_index, SUM(count), SUM(duration), ts".
      " FROM %s WHERE task_id=%d GROUP BY student_id, sub_index;",
      $table, $backup, $task_id);
  echo $sql. "<BR>\n";
  if (!$medoo->query($sql)) {
    echo "Failed to aggregate: ". get_db_error2($medoo);
    return false;
  }
  return true;
}

function verify($task_id) {
  global $medoo;
  
  $table = "task_records";
  $backup = "task_records_backup";

  $sql = sprintf("SELECT student_id, sub_index,". 
      " SUM(count) as c, SUM(duration) as d".
      " FROM %s WHERE task_id=%d GROUP BY student_id, sub_index",
      $backup, $task_id);
  $origs = $medoo->query($sql)->fetchAll();

  $sql = sprintf("SELECT student_id, sub_index,". 
      " `count` as c, `duration` as d".
      " FROM %s WHERE task_id=%d",
      $backup, $task_id);

  $now = $medoo->query($sql)->fetchAll();
  if (!empty(array_diff($origs, $now))) {
    var_dump(array_diff($origs, $now));
    return false;
  }
  return true;
}

function compress_guanxiu_records($task_id) {
  global $medoo;

  if (!($rows = backup_records($task_id))) {
    echo sprintf("Failed to backup for task %d<BR>\n", $task_id);
    echo get_db_error2($medoo); 
    return false;
  }

  if (!delete_records($task_id, $rows)) {
    echo sprintf("Failed to delete task records for %d<BR>\n", $task_id);
    echo get_db_error2($medoo); 
    return false;
  }

  echo "delete completed<br>\n";

  if (!aggregate_records($task_id)) {
    echo sprintf("Failed to aggregate for %d with task %d<BR>\n", 
        $student_id, $task_id);
    echo get_db_error2($medoo); 
    return false;
  }

  echo "Aggregate finished. Verifying...<br>\n";
  if (!verify($task_id)) {
    return false;
  }

  echo "DONE<BR>\n";
  return true;
}

function restore($task_id) {
  global $medoo;

  $table = "task_records";
  $backup = "task_records_backup";

  if (!table_exists($medoo, $backup)) {
    return false;
  }
  delete_records($task_id);

  
  $sql = sprintf("INSERT INTO %s SELECT * FROM %s", $table, $backup);
  echo $sql. "<BR>\n";
  return $medoo->query($sql)->fetchAll();
}

if (empty($_SESSION["user"])) {
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
  if (!isSysAdmin($user)) exit();

  verify(4);
//   if (isset($_GET["restore"])) {
//     restore(4);
//   } else {
//     compress_guanxiu_records(4);    
//   }
}
?>
