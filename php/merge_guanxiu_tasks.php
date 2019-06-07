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

$medoo = get_medoo();

function verify($medoo) {
    $result1 = $medoo->sum("task_records", "count", ["task_id" => 4]);
    $result2 = $medoo->sum("temp", "count");
    echo "sum1: ". $result1. " vs sum2: ". $result2. ".<br>";
    if ($result1 != $result2) {
        echo "initial verification failed.<br>";
        exit(0);
    }

    $result1 = $medoo->sum("task_records", "duration", ["task_id" => 4]);
    $result2 = $medoo->sum("temp", "duration");
    echo "duration1: ". $result1. " vs duration2: ". $result2. ".<br>";
    if ($result1 != $result2) {
        echo "initial verification failed.<br>";
        exit(0);
    }
    
    $result1 = $medoo->count("task_records", ["task_id" => 4]);
    $result2 = $medoo->count("temp");
    echo "count1: ". $result1. " vs count2: ". $result2. ".<br>";
    if ($result1 < $result2) {
        echo "initial verification failed.<br>";
        exit(0);
    }
}

$action = empty($_GET["action"]) ? null : $_GET["action"];

if ($action == "backup") {
    $result = $medoo->query("CREATE TABLE task_records_backup 
            SELECT * FROM task_records where task_id=4;");
    if (empty($result)) {
        echo "back up failed". get_db_error2($medoo);
    } else {
        echo "backup successfully.";
    }
} else if ($action == "restore") {
    $result = $medoo->query("DELETE from task_records where task_id=4;");
    var_dump($result);
    echo "<br>";

    $result = $medoo->query("INSERT INTO task_records
        SELECT * FROM task_records_backup;");
    if (empty($result)) {
        echo "failed to restore". get_db_error2($medoo);
        exit();
    }
    var_dump($result);
    echo "restored.<br>";
} else if($action == "do_it") {
    if (!table_exists($medoo, "task_records_backup")) {
        $result = $medoo->query("CREATE TABLE task_records_backup 
            SELECT * FROM task_records where task_id=4;");
        if (empty($result)) {
            echo "back up failed". get_db_error2($medoo);
        } else {
            echo "backup successfully.";
        }
    }

    echo "Counting duplicateds...";
    $result = $medoo->query("SELECT COUNT(*) FROM task_records WHERE task_id=4
        GROUP BY student_id, sub_index HAVING COUNT(*) > 1;")->fetchAll();
    if (empty($result)) {
        echo "no duplicates at all, done.<br>";
        exit();
    }
    echo "found ". count($result). " duplicates.<br>";

    echo "aggregating...";
    $result = $medoo->query("DROP TABLE temp;");
    $result = $medoo->query("CREATE TABLE temp
        SELECT MIN(id) as id, student_id, task_id, SUM(count)
        as count, SUM(duration) as duration, sub_index, MIN(ts) as ts FROM
        task_records WHERE task_id=4 GROUP BY task_id, student_id, sub_index;");
    if (empty($result)) {
        echo "failed to aggregate". get_db_error2($medoo);
        exit();
    }
    var_dump($result);
    echo "aggregated.<br>";

    verify($medoo);
    
    echo "deleting old data...";
    $result = $medoo->query("DELETE from task_records where task_id=4;");
    if (empty($result)) {
        echo "failed to delete old data". get_db_error2($medoo);
        exit();
    }
    var_dump($result);
    echo "deleted<br>";

    echo "updating....<br>";
    $result = $medoo->query("INSERT INTO task_records SELECT * FROM temp;");
    if (empty($result)) {
        echo "failed to restore data". get_db_error2($medoo);
        exit();
    }
    echo "updated.";
    verify($medoo);
} else if ($action == "clean_up") {
    echo "dropping task_records_backup...";
    $result = $medoo->query("DROP TABLE task_records_backup;");
    if (empty($result)) {
        echo "failed to dropping backup table". get_db_error2($medoo);
        exit();
    }
    echo "done.<br>";
    echo "dropping temp...";
    $result = $medoo->query("DROP TABLE temp;");
    if (empty($result)) {
        echo "failed to dropping temp table". get_db_error2($medoo);
        exit();
    }
    echo "done.<br>";
} else {
    echo "Usage 'action=backup/restore/do_it/clean_up'.<br>";
}
?>
