<?php
include_once 'config.php';
include_once 'tables.php';

$response = null;

if (empty($_SESSION["user"]) && empty($_COOKIE["email"])) {
  if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
    $resource_id = $_GET["rid"];
  
    if ($resource_id == "departments") {
      $response = get_departments();
    } elseif ($resource_id == "classes") {
      $response = get_classes(null);
    }
  }
  
  if (!$response) {
    echo '{"error": "login needed"}';
  }

  exit();
}

if (empty($_SESSION["user"])) {
	$user = get_user($_COOKIE["email"]);
	if (!$user || $user->permission > 7) {
	  echo '{"error": "login needed"}';
	  exit();
  }
	
  $user->password = null;
  $_SESSION["user"] = serialize($user);
} else {
	$user = unserialize($_SESSION["user"]);
}

$student_id = $user->id;

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
  $resource_id = $_GET["rid"];
  $classId = empty($_GET["classId"]) ? $user->classId : $_GET["classId"];

  if ($resource_id == "departments") {
    $response = get_departments();
  } elseif ($resource_id == "classes") {
    if (empty($_GET["classId"])) {
      $response = get_classes(null);
    } else {
      $response = get_classes($classId);
    }
  } elseif ($resource_id == "course_groups") {
    $response = get_course_groups($_GET["detailed"]);
  } elseif ($resource_id == "admins") {
    $response = get_admins(intval($_GET["permission"]));
  } elseif ($resource_id == "tasks") {
    if (isset($_GET["task_id"]) && isset($_GET["pos"])) {
      $task_id = $_GET["task_id"];
      $pos = $_GET["pos"];
      
      if ($pos == "last") {
        $response = get_last_task_record($student_id, $task_id);
      }
    } elseif (isset($_GET["department_id"])) {
      $response = get_tasks($_GET["department_id"]);
    } else {
      $response = get_tasks(null);
    }
  } elseif ($resource_id == "courses") {
    $response = get_courses($_GET["group_id"]);
  } elseif ($resource_id == "users") {
    $email = empty($_GET["email"]) ? null : $_GET["email"];
    $classId = empty($_GET["classId"]) ? null : $_GET["classId"];
    $all = empty($_GET["all"]) ? null : $_GET["all"];

    if ($all) {
      $response = get_users(null, null, null, $all);
    } elseif ($classId) {
      $response = get_users($email, $classId);
    } elseif ($email) {
      $response = current(get_users($email));
    } else {
      $response = $user;
    }
  } elseif ($resource_id == "learning_records" && !empty($_GET["classId"])) {
    $response = get_schedules($_GET["classId"], $_GET["records"], $user->id);
  } elseif ($resource_id == "search") {
    $response = search($_GET["prefix"]);
  } elseif ($resource_id == "task_stats") {
    $response = get_class_task_stats($classId, $_GET["task_id"]);
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
  $resource_id = $_POST["rid"];
  
  $task_user_id = $student_id;
  if (!empty($_POST["student_id"])) {
    if ($user->permission <= 7) {
      $response =
          ["error" => "permission denied, you can't report tasks for others"];
      echo json_encode($response);
      return;
    } else {
      // Admins can report for others.
      $task_user_id = $_POST["student_id"];
    }
  } 
  
  if ($resource_id == "tasks") {
    $task_id = $_POST["task_id"];
    report_task($task_user_id, $task_id, $_POST["count"], $_POST["sum"]);
    $response = get_last_task_record($task_user_id, $task_id);
  } elseif ($resource_id == "task") {
    $response = ["updated" => update_task($_POST)];
  } elseif ($resource_id == "schedule_tasks") {
    $response = ["updated" => report_schedule_task($task_user_id, $_POST)];
  } elseif ($resource_id == "schedule") {
    $response = ["updated" => update_schedule($_POST)];
  }  elseif ($resource_id == "schedule_group") {
    $response = ["updated" => update_schedule_group($_POST)];
  } elseif ($resource_id == "class") {
    $response = ["updated" => update_class($_POST)]; 
  } elseif ($resource_id == "course_group") {
    $response = ["group" => update_course_group($_POST)];
  } elseif ($resource_id == "department") {
    $response = ["updated" => update_department($_POST)];
  } elseif ($resource_id == "course") {
    $response = update_course($_POST); 
  } elseif ($resource_id == "user") {
    if (!empty($_POST["classId"]) && intval($_POST["classId"]) == 0) {
      if(!empty($_POST["classId_label"]) &&
          !empty($_POST["start_year_label"])) {
            $class_name = $_POST["start_year_label"]. $_POST["classId_label"];
            $classId = get_class_id($class_name);
      
            if (!$classId) {
              $classId = create_class($class_name, date("Y"));
            }
      
            if (!$classId) {
              $response = ["error" => "failed to create class ". $class_name];
            } else {
              $_POST["classId"] = $classId;
            }
          } else {
            $response = ["error" => "check class_label and start_year_label"];
          }
    }
    
    if (!$response) {
      $result = update_user($_POST);
      if ($result && $result->id == $user->id) {
        $user = $result;
        $_SESSION['user'] = serialize($user);
      }
  
      $response = ["updated" => ($result ? 1 : 0)];
      if (!$result) {
        $response["error"] = get_db_error();
      }
    }
  }
} elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE" &&
    isset ( $_REQUEST["rid"] )) {

  $resource_id = $_REQUEST["rid"];
  if ($resource_id == "course_group") {
    $response = ["deleted" => remove_course_group($_REQUEST["id"])];
  } elseif ($resource_id == "schedule_group") {
    $response = ["deleted" => remove_schedule_group($_REQUEST["id"])];
  } elseif ($resource_id == "course") {
    $response = ["deleted" => remove_course($_REQUEST["id"])];
  } elseif ($resource_id == "schedule") {
    $response = ["deleted" => remove_schedule($_REQUEST["id"])];
  } elseif ($resource_id == "class") {
    $response = ["deleted" => remove_class($_REQUEST["id"])];
  } elseif ($resource_id == "task") {
    $response = ["deleted" => remove_task($_REQUEST["id"])];
  } elseif ($resource_id == "user") {
    $response = ["deleted" => remove_user($_REQUEST["id"])];
  } elseif ($resource_id == "department") {
    $response = ["deleted" => remove_department($_REQUEST["id"])];
  }     
}

if ($response) {
  if (is_array($response) && isset($response["updated"]) &&
      intval($response["updated"]) == 0) {
    $response["error"] = get_db_error();
  }

  echo json_encode($response);
}
?>
