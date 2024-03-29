<?php
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";
include_once "tables.php";

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
  if (!isSysAdmin($user) || $user->id != 66) exit();
}

$medoo = get_medoo();

function verify($medoo) {
}

function duplicate_reports($medoo, $reports, $second_id) {
    $records = 0;

    foreach($reports as $report) {
        // echo "======<br>\n";
        // foreach ($report as $key => $value) {
        //     echo $key. " => ". $value. "<br>\n";
        // }
        // echo "======<br>\n";
        $fields = ["video", "text", "attended"];

        if (is_empty_data($report, $fields)) {
            $medoo->delete("schedule_records", ["AND" => [
                "student_id" => intval($report["student_id"]),
                "course_id" => intval($report["course_id"])
            ]]);
            echo "deleted an empty schedule record<br>\n";
            var_dump($report);
            continue;
        }

        $where = [
            "AND" => [
                "student_id" => intval($report["student_id"]),
                "course_id" => intval($second_id)
            ]
        ];

        if (!empty($medoo->select("schedule_records", "*", $where))) {
            continue;
        }

        $datas = [];
        foreach($fields as $field) {
            $datas[$field] = intval($report[$field]);
        }
        $rows = $medoo->update2("schedule_records", $datas, $where);
        if (!$rows) {
            $datas["student_id"] = intval($report["student_id"]);
            $datas["course_id"] = intval($second_id);
            $medoo->insert2("schedule_records", $datas);
            if (empty($medoo->select("schedule_records", "*", $where))) {
                echo "failed to duplicated task records.". get_db_error2($medoo). "<br>\n";
                echo $medoo->last_query(). "<br>\n";
                var_dump($report);
                echo "<br>\n";
                continue;
            }
        }
      
        $records++;
    }
    return $records;
}

function duplicate_schedules($medoo, $schedules, $second_id) {
    $records = 0;

    foreach($schedules as $schedule) {
        if (intval($schedule["course_id2"])) {
            echo "schedule course_id2 is not empty<br>\n";
            var_dump($schedule);
            echo "<br>\n";
            continue;
        }

        if ($medoo->update2("schedules", ["course_id2" => $second_id],
                ["id" => $schedule["id"]])) {
            $records++;
        } else {
            echo "failed to duplicated schedules <br>\n". get_db_error2($medoo);
            echo $medoo->last_query();
            echo "<br>\n";
        }
    }
    return $records;
}

function split_course($medoo, $course) {
    $course_id = $course["id"];
    unset($course["id"]);

    $name = $course["name"];
    $other_names = [];
    if(preg_match("/[^\d]+(\d+)[\/|-](\d+).*/", $name, $matches)) {
        $index1 = intval($matches[1]);
        $index2 = intval($matches[2]);
        if ($index2 != $index1 + 1) {
            echo "Indexes are not valid ". $index1. " vs ". $index2. "<br>\n";
            return 0;
        }
        echo "<br>\n =============== spliting ". $name. "...";
        $name1 = preg_replace("/(\d+)[\/|-](\d+)/", $index1, $name);
        $other_names = [preg_replace("/(\d+)[\/|-](\d+)/", $index2, $name)];
        $name = $name1;
        echo " into ". $name. " and ". $other_names[0]. "<br>\n";
    } else {
        echo "<br>\n =============== spliting by space ". $name. "...";
        $other_names = explode(" ", $name);
        $name = array_shift($other_names);
        echo " into ". $name. " and ". join($other_names). "<br>\n";
    }

    $reports = $medoo->select("schedule_records", "*", ["course_id" => $course_id]);
    $schedules = $medoo->select("schedules", "*", ["course_id" => $course_id]);

    foreach($other_names as $name2) {
        echo "creating new course ". $name2. "...";
        $second_id = $medoo->select("courses", "id", ["name" => $name2]);

        if (empty($second_id)) {
            $course["name"] = $name2;
            $second_id = $medoo->insert2("courses", $course);
            echo "created new course. ". $name2. ", id: ". $second_id. "<br>\n";
        } else {
            $second_id = current($second_id);
            echo "second course already exists. ". $name2. ", id: ". $second_id. "<br>\n";
        }

        if (!empty($reports)) {
            $records = duplicate_reports($medoo, $reports, $second_id);
            echo "duplicated ". $records. " schedule records.<br>\n";
        }

        if (!empty($schedules)) {
            $records = duplicate_schedules($medoo, $schedules, $second_id);
            echo "duplicated ". $records. " schedules.<br>\n";
        }
    }

    if ($medoo->update2("courses", ["name" => $name], ["id" => $course_id])) {
        echo "renamed to ". $name. "<br>\n";
    } else {
        echo "failed to rename to ". $name;
    }
}

$courses = $medoo->select("courses", ["id", "name", "group_id"],
    ["name[~]" => "%/%"]);
$courses = array_merge($courses, 
    $medoo->select("courses", ["id", "name", "group_id"],
        ["name[~]" => "%-%"]));
$others = ["入行论广解第201课 二规教言论讲记第1课", 
    "二规教言论讲记第12课 佛子行讲记第1课", 
    "佛子行讲记第8课 《修心八颂》要义",
    "《上师瑜伽速赐加持》讲记 释尊仪轨讲记",
    "吸烟之过患 饮酒之过患 吃肉之过患",
    "六字真言转经轮之功德 快乐之歌讲记 费闲歌释",
];
$courses = array_merge($courses, 
    $medoo->select("courses", ["id", "name", "group_id"],
        ["name" => $others]));

foreach($courses as $course) {
    split_course($medoo, $course);
}
?>
