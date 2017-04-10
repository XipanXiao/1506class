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
  
  $fields = ["id", "user_id", "status", "sub_total", "paid", "shipping",
  		"shipping_date", "deliver_date", "created_time"];
  $address_fields = ["phone", "street", "city", "state", "country", "zip"];
  
  if ($withAddress) {
  	$fields = array_merge($fields, $address_fields);
  }

  $orders = $medoo->select("orders", $fields, ["AND" => 
      array_merge($userFilter, $statusFilter, $timeFilter)]); 
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

  $items = [];
  foreach ($order["items"] as $item) {
    array_push($items, $item);
  }
  unset($order["items"]);

  $id = $medoo->insert("orders", $order);
  if (!$id) return false;

  foreach ($items as $item) {
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

function update_order($order) {
  global $medoo;

  $data = build_update_data(["status", "paid", "shipping"], $order);
  return $medoo->update("orders", $data, ["id" => $order["id"]]);
}

function get_shop_items($id) {
  global $medoo;

  return keyed_by_id($medoo->select("items", "*", $id ? ["id" => $id] : null));
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
      $response = isOrderManager($user)
      ? get_orders(null, $_GET, $_GET["items"], canReadOrderAddress($user))
      : permision_denied_error();
    } else {
      $response = $_GET["student_id"] == $user->id
      ? get_orders($user->id, $_GET, $_GET["items"], canReadOrderAddress($user))
      : permision_denied_error();
    }
  } elseif ($resource_id == "items") {
    $response = get_shop_items($_GET["id"]);
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
      $response = ["updated" => update_order($order)];
    }
  }
} elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE" &&
    isset ( $_REQUEST["rid"] )) {

  $resource_id = $_REQUEST["rid"];

  if ($resource_id == "orders") {
    if (isOrderManager($user)) {
      $response = ["deleted" => delete_order($_REQUEST["id"])];
    } else {
      $order = get_order($_REQUEST["id"]);
      if (!$order || $order["user_id"] != $user->id) {
        $response = permision_denied_error();
      } elseif ($order["status"] == OrderStatus::CREATED) {
        $response = ["deleted" => delete_order($_REQUEST["id"])];
      }
    }
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
