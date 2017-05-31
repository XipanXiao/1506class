<?php
/// 订书模块
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";

$medoo = get_medoo();

abstract class OrderStatus
{
  /// Only new created orders can be cancelled (deleted) by the buyer.
  const CREATED = 0;
  /// Shipped.
  const SHIPPED = 1;
  /// Shipped and paid, no further actions are needed.
  const COMPLETED = 3;
  
  static function fromString($value) {
    $map = ["CREATED" => 0, "SHIPPED" => 1, "COMPLETED" => 3];
    return $map[$value];
  }
}

/// Checks whether we can close an order (shipped and paided).
function _canClose($order) {
  return $order["status"] == OrderStatus::COMPLETED;
}

function get_order($id) {
  global $medoo;
  
  $orders = $medoo->select("orders", "*", ["id" => $id]);
  if (empty($orders)) return null;
  
  $order = current($orders);
  $order["items"] = $medoo->select("order_details", "*", ["order_id" => $id]);
  
  return $order;
}

function get_orders($user_id, $filters, $withItems, $withAddress) {
  global $medoo;
  
  $timeFilter = ["created_time[><]" => [$filters["start"], $filters["end"]]];
  $statusFilter = $filters["status"]
      ? ["status" => OrderStatus::fromString($filters["status"])]
      : [];
  $userFilter = $user_id ? ["user_id" => $user_id] : [];
  $classFilter = [];
  if (empty($userFilter) && !empty($filters["class_id"])) {
    $userIds = $medoo->select("users", "id", 
        ["classId" => $filters["class_id"]]);
    $classFilter = ["user_id" => $userIds];
  }
  
  $fields = ["id", "user_id", "status", "sub_total", "paid", "shipping",
      "int_shipping", "shipping_date", "paid_date", "created_time", "name",
  		"paypal_trans_id", "usps_track_id"];
  $address_fields = 
      ["phone", "email", "street", "city", "state", "country", "zip"];
  
  if ($withAddress) {
    $fields = array_merge($fields, $address_fields);
  }

  $orders = $medoo->select("orders", $fields, ["AND" => 
      array_merge($userFilter, $statusFilter, $timeFilter, $classFilter)]); 
  if (!$withItems) return $orders;

  foreach ($orders as $index => $order) {
    $order["items"] = $medoo->select("order_details", "*", 
        ["order_id" => $order["id"]]);
    $orders[$index] = $order;
  }
  return $orders;
}

function place_order($order) {
  global $medoo;

  $items = $order["items"];
  unset($order["items"]);

  $order = array_merge($order, sanitize_address());
  $id = $medoo->insert("orders", $order);
  if (!$id) return false;

  foreach ($items as $item) {
    unset($item["id"]);
    $item["order_id"] = $id;
    $medoo->insert("order_details", $item);
  }
  return $id;
}

function close_order($id) {
  global $medoo;
  
  $order = get_order($id);
  if (!$order || !_canClose($order)) return false;
  
  $sql = sprintf("INSERT INTO closed_order_details SELECT". 
      "  * from order_details WHERE order_id = %d;", intval($id));
  $medoo->query($sql);
  
  $sql = sprintf("INSERT INTO closed_orders SELECT". 
      "  * from orders WHERE id = %d;", intval($id));
  $medoo->query($sql);
  
  $medoo->delete("order_details", ["order_id" => $id]);
  return $medoo->delete("orders", ["id" => $id]);
}

function delete_order($id) {
  global $medoo;
  
  $medoo->delete("order_details", ["order_id" => $id]);
  return $medoo->delete("orders", ["id" => $id]);
}

function update_order($order, $is_manager) {
  global $medoo;

  $data = [];
  if ($is_manager) {
    $data = build_update_data(["status", "paid", "shipping", "int_shipping"],
        $order);
    if (isset($order["usps_track_id"])) {
      $data["usps_track_id"] = filter_input(INPUT_POST, "usps_track_id", 
          FILTER_VALIDATE_REGEXP, 
          ["options" => ["regexp" => "/\b[\dA-Z]+\b/"]]);
    }
  } else {
  	if (isset($order["paypal_trans_id"])) {
  		$data["paypal_trans_id"] = filter_input(INPUT_POST, "paypal_trans_id",
  				FILTER_VALIDATE_REGEXP,
  				["options" => ["regexp" => "/\b[\dA-Z]{17}\b/"]]);
  	}
  }

  return $medoo->update("orders", $data, ["id" => $order["id"]]);
}

function sanitize_address() {
  if (!is_country_code($_POST["country"])) return null;

  $data = [];
  foreach (["name", "phone", "street", "city", "zip"] as $key) {
    $data[$key] = filter_input(INPUT_POST, $key, FILTER_SANITIZE_STRING,
        FILTER_REQUIRE_SCALAR);
    if (empty($data[$key])) exit();
  }
  return $data;
}

function get_shop_items($category) {
  global $medoo;

  $where = ["deleted[!]" => 1];
  if ($category) {
    $where = ["AND" => ["deleted[!]" => 1, "category" => $category]];
  }
  return keyed_by_id($medoo->select("items", "*", $where));
}

function get_item_categories() {
  global $medoo;

  return keyed_by_id($medoo->select("item_categories", "*"));
}

function get_order_stats($year) {
  global $medoo;

  $classes = keyed_by_id($medoo->select("classes", ["id", "name"], 
      ["start_year" => $year]));
  
  if (empty($classes)) return [];
  
  foreach ($classes as $classId => $classInfo) {
    $userIdSql = sprintf("SELECT id FROM users WHERE classId=%d",
        intval($classId)); 
    $orderIdSql = sprintf("SELECT id FROM orders WHERE user_id IN (%s)",
        $userIdSql);
    $sql = sprintf("SELECT item_id, price, sum(count) as group_count FROM ".
        "order_details WHERE order_id IN (%s) GROUP BY item_id;", $orderIdSql);
    $stats = $medoo->query($sql)->fetchAll();
    
    if (empty($stats)) {
      unset($classes[$classId]);
    } else {
      $classInfo["stats"] = keyed_by_id($stats, "item_id");
      $classes[$classId] = $classInfo;
    }
  }
  return $classes;
}

function merge_orders($order_ids) {
  global $medoo;

  $orders = $medoo->select("orders", "*", ["id" => $order_ids]);
  if (sizeof($orders) < 2) return;
  
  $first_order = array_shift($orders);
  $id = $first_order["id"];
  $user_id = $first_order["user_id"];
  $status = $first_order["status"];
  
  foreach ($orders as $index => $order) {
    if ($order["user_id"] != $user_id || $order["status"] != $status ||
        !same_address($first_order, $order)) continue;
    
    $first_order["sub_total"] += $order["sub_total"];
    $first_order["paid"] += $order["paid"];
    $first_order["shipping"] += $order["shipping"];
    
    if ($medoo->update("order_details", ["order_id" => $id], 
        ["order_id" => $order["id"]])) {
      $medoo->delete("orders", ["id" => $order["id"]]);    
    }
  }

  $data = ["sub_total" => $first_order["sub_total"], 
      "paid" => $first_order["paid"], "shipping" => $first_order["shipping"]];
  return ["updated" => $medoo->update("orders", $data, ["id" => $id])];
}

$response = null;

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
}

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
  $resource_id = $_GET["rid"];
  if ($resource_id == "orders") {
    if (isset($_GET["order_id"])) {
      $order = get_order($_GET["order_id"]);
      if (!$order) {
        $response = "{}";
      } elseif (isOrderManager($user) || $order["user_id"] == $user->id) {
        $response = $order;
      } else {
        $response = permision_denied_error();
      }
    } elseif (empty($_GET["student_id"])) {
      $granted = isOrderManager($user) || 
          isClassLeader($user, $user->classId) && !empty($_GET["class_id"]); 
      $response = $granted 
          ? get_orders(null, $_GET, $_GET["items"], canReadOrderAddress($user))
          : permision_denied_error();
    } else {
      $response = $_GET["student_id"] == $user->id
      ? get_orders($user->id, $_GET, $_GET["items"], canReadOrderAddress($user))
      : permision_denied_error();
    }
  } elseif ($resource_id == "items") {
    $response = get_shop_items($_GET["id"], $_GET["category"]);
  } elseif ($resource_id == "item_categories") {
    $response = get_item_categories();
  } elseif ($resource_id == "order_stats") {
    $response = isOrderManager($user) 
        ? get_order_stats($_GET["year"]) 
        : permision_denied_error();
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
  $resource_id = $_POST["rid"];

  if ($resource_id == "orders") {
    $order = $_POST;
    unset($order["rid"]);

    if ($order["user_id"] != $user->id && !isOrderManager($user)) {
      $response = permision_denied_error();
    } elseif (empty($order["id"])) {
      $response = ["updated" => place_order($order)];
    } else {
      $response = ["updated" => update_order($order, isOrderManager($user))];
    }
  } elseif ($resource_id == "merge_orders" && !empty($_POST["order_ids"])) {
    $response = canReadOrderAddress($user) 
        ? merge_orders($_POST["order_ids"])
        : permision_denied_error();
  }
} elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE" &&
    isset ( $_REQUEST["rid"] )) {

  $resource_id = $_REQUEST["rid"];

  if ($resource_id == "orders" && isOrderManager($user)) {
    $response = ["deleted" => delete_order($_REQUEST["id"])];
  }
}

if (is_array($response) && empty($response)) {
  echo '[]';
  return;
}

if ($response) {
  if (is_array($response) && isset($response["updated"]) &&
      intval($response["updated"]) == 0) {
        $response["error"] = get_db_error2($medoo);
      }

  echo json_encode($response);
}
?>
