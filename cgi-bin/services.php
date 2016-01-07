<?php
include_once 'config.php';
include_once 'tables.php';

$response = null;

if (empty($_SESSION["user"])) {
  if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
    $resource_id = $_GET["rid"];
  
    if ($resource_id == "class_groups") {
      $response = get_class_groups();
    } elseif ($resource_id == "classes") {
      $response = get_classes(null);
    }
  }
  
  if (!$response) {
    echo '{"error": "login needed"}';
  }

  exit();
}

$user = unserialize($_SESSION["user"]);
$student_id = $user->id;

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
  $resource_id = $_GET["rid"];
  $class_id = empty($_GET["class_id"]) ? $user->classId : $_GET["class_id"];

  if ($resource_id == "class_groups") {
    $response = get_class_groups();
  } elseif ($resource_id == "classes") {
    if (empty($_GET["class_id"])) {
      $response = get_classes(null);
    } else {
      $response = get_classes($class_id);
    }
  } else if ($resource_id == "tasks") {
    if (isset($_GET["task_id"]) && isset($_GET["pos"])) {
      $task_id = $_GET["task_id"];
      $pos = $_GET["pos"];
      
      if ($pos == "last") {
        $last_record = get_last_task_record($student_id, $task_id);
        $last_record["sum"] = task_sum($student_id, $task_id);

        $response = $last_record;
      } else if ($pos == "sum") {
        $response = ["sum" => task_sum($student_id, $task_id)];
      }
    } else {
      $response = get_tasks($user->classInfo["department_id"]);
    }
  } elseif ($resource_id == "courses") {
    $response = get_courses($class_id);
  } elseif ($resource_id == "users") {
    $email = empty($_GET["email"]) ? null : $_GET["email"];
    $class_id = empty($_GET["class_id"]) ? null : $_GET["class_id"];
    
    if ($class_id) {
      $response = get_users($email, $class_id);
    } elseif ($email) {
    	$response = current(get_users($email));
    } else {
    	$response = $user;
    }
  } elseif ($resource_id == "learning_records" && !empty($_GET["class_id"])) {
    $response = get_schedules($_GET["class_id"], $_GET["records"], $user->id);
  } elseif ($resource_id == "search") {
  	$response = search($_GET["prefix"]);
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
  $resource_id = $_POST["rid"];
  
  $task_user_id = $student_id;
  if (!empty($_POST["student_id"])) {
  	if ($user->permission <= 1) {
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
    $count = $_POST["count"];
    report_task($task_user_id, $task_id, $count);
    $response = ["sum" => task_sum($task_user_id, $task_id)];
  } elseif ($resource_id == "schedule_tasks") {
    $response = ["updated" => report_schedule_task($task_user_id, $_POST)];
  } elseif ($resource_id == "schedule") {
    $response = ["updated" => update_schedule($_POST)];
  } elseif ($resource_id == "user") {
  	if (intval($_POST["classId"]) == 0 && !empty($_POST["classId_label"]) &&
  			!empty($_POST["start_year_label"] && !empty($_POST["start_year"]))) {
  		$class_name = $_POST["start_year_label"]. $_POST_POST["classId_label"];
  		$class_id = get_class_id($class_name);
  		
  		if (!$class_id) {
  			$class_id = create_class($class_name, intval($_POST["start_year"]));
  			
  		}
  		
  		if (!class_id) {
  		  $response = ["error" => "failed to create class ". $class_name];
  		} else {
  			$_POST["classId"] = $class_id;
  		}
  	}
  	
  	$result = update_user($_POST);
  	if ($result && $result->id == $user->id) {
  		$user = $result;
		  $_SESSION['user'] = serialize($user);
  	}

  	$response = ["updated" => ($result ? 1 : 0)];
  }
}

if ($response) {
  echo json_encode($response);
}
?>
