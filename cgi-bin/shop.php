<?php
/// 订书模块
include_once 'config.php';
include_once "connection.php";
include_once 'permission.php';
include_once "util.php";

$medoo = get_medoo();

abstract class OrderStatus
{
  /// Only new created orders can be cancelled (deleted) by the buyer.
  const CREATED = 0;
  /// When an order manager starts to work (e.g. inform the fulfil department)
  /// on an order, the order is being processed, and can cannot be cancelled 
  /// by the buyer. It can still be deleted by an order manager, if nothing is
  /// paid by the buyer.
  const PROCESSING = 1;
  /// Shipped.
  const SHIPPED = 3;
}

/// Checks whether we can close an order (shipped and paided).
function _canClose($order) {
  return $order["status"] == OrderStatus::SHIPPED &&
      $order["paid"] == $order["sub_total"];
}

function create_shop_tables() {
  global $medoo;

  $name = "item_categories";
  if (!table_exists($medoo, $name)) {
      $result = $medoo->query("CREATE TABLE ". $name. "(
        id MEDIUMINT PRIMARY KEY AUTO_INCREMENT,
        parent_id MEDIUMINT,
        name VARCHAR(64) COLLATE utf8_unicode_ci NOT NULL
        )");
    if (empty($result)) {
      error_log(get_db_error2($medoo));
      return false;
    }
    $medoo->insert($name, ["name" => "法本"]);
  }
  
  $name = "items";
  if (!table_exists($medoo, $name)) {
      $result = $medoo->query("CREATE TABLE ". $name. "(
        id INT PRIMARY KEY AUTO_INCREMENT,
        category MEDIUMINT,
          FOREIGN KEY (category) REFERENCES item_categories(id),
        price DECIMAL NOT NULL,
        name VARCHAR(64) COLLATE utf8_unicode_ci NOT NULL,
        image VARCHAR(256) COLLATE utf8_unicode_ci,
        producer VARCHAR(64) COLLATE utf8_unicode_ci,
        description VARCHAR(64) COLLATE utf8_unicode_ci
        )");
    if (empty($result)) {
      error_log(get_db_error2($medoo));
      return false;
    }
    $medoo->insert($name, 
        ["category" => 1, "price" => 23.0, "name" => "预科系入行论教材", 
            "image" => "images/ruxinglun.jpg", "producer" => "索达吉堪布"]);
    $medoo->insert($name, 
        ["category" => 1, "price" => 22.0, "name" => "预科系加行教材", 
            "image" => "images/jiaxing.jpg", "producer" => "索达吉堪布"]);
    $medoo->insert($name, 
        ["category" => 1, "price" => 21.0, "name" => "预科系净土教材", 
            "image" => "images/jingtu.jpg", "producer" => "索达吉堪布"]);
  }
  
  $name = "orders";
  if (!table_exists($medoo, $name)) {
      $result = $medoo->query("CREATE TABLE ". $name. "(
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        status TINYINT NOT NULL DEFAULT ". OrderStatus::CREATED. ",
        extra_cost DECIMAL,
        sub_total DECIMAL NOT NULL DEFAULT 0,
        paid DECIMAL,
        `email` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
        `phone` varchar(16) COLLATE utf8_unicode_ci DEFAULT NULL,
        `street` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
        `city` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
        `state` tinyint(4) DEFAULT NULL,
        `country` char(2) COLLATE utf8_unicode_ci DEFAULT NULL,
        `zip` char(6) COLLATE utf8_unicode_ci DEFAULT NULL,
        created_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
        )");
    if (empty($result)) {
      error_log(get_db_error2($medoo));
      return false;
    }
  }
  
  $name = "closed_orders";
  if (!table_exists($medoo, $name)) {
    $result = $medoo->query("CREATE TABLE ". $name. 
        " SELECT * FROM orders LIMIT 0");
      if (empty($result)) {
      error_log(get_db_error2($medoo));
      return false;
    }
  }
  
  $name = "order_details";
  if (!table_exists($medoo, $name)) {
      $result = $medoo->query("CREATE TABLE ". $name. "(
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        item_id INT,
        FOREIGN KEY (item_id) REFERENCES items(id),
        price DECIMAL NOT NULL,
        count MEDIUMINT NOT NULL DEFAULT 1
      )");
    if (empty($result)) {
      error_log(get_db_error2($medoo));
      return false;
    }
  }

  $name = "closed_order_details";
  if (!table_exists($medoo, $name)) {
    $result = $medoo->query("CREATE TABLE ". $name. 
        " SELECT * FROM order_details LIMIT 0");
      if (empty($result)) {
      error_log(get_db_error2($medoo));
      return false;
    }
  }
  return true;
}

function get_order($id) {
  global $medoo;
  
  $orders = $medoo->select("orders", "*", ["id" => $id]);
  if (empty($orders)) return null;
  
  $order = current($orders);
  $order["items"] = $medoo->select("order_details", "*", ["order_id" => $id]);
  
  return $order;
}

function get_orders($user_id, $start_timestamp, $end_timestamp) {
  global $medoo;
  
  $timeFilter = ["created_time[><]" => [$start_timestamp, $end_timestamp]];
  if ($user_id) {
    return $medoo->select("orders", "*", ["AND" => 
        array_merge(["user_id" => $user_id], $timeFilter)]); 
  } else {
    return $medoo->select("orders", "*", $timeFilter);
  }
}

function place_oder($order) {
  global $medoo;

  $id = $medoo->insert("orders", $order);
  if (!$id) return false;

  foreach ($order["items"] as $item) {
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
  
  $order = get_order($id);
  if (!$order) return false;
  
  if (intval($order["status"]) != OrderStatus::CREATED) return false;
  
  $medoo->delete("order_details", ["order_id" => $id]);
  return $medoo->delete("orders", ["id" => $id]);
}

function update_order($order) {
  global $medoo;
  
  $data = [];
  foreach (["status", "extra_cost"] as $key) {
    if (isset($order[$key])) $data[$key] = $order[$key];
  }
  
  $updated = $medoo->update("orders", $data, ["id" => $order["id"]]);

  $medoo->delete("order_details", ["order_id" => $order["id"]]);
  foreach ($order["items"] as $item) {
    $item["order_id"] = $id;
    $medoo->insert("order_details", $item);
  }

  return $updated;
}

function get_shop_items() {
  global $medoo;

  create_shop_tables();
  return $medoo->select("items", "*");
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
      ? get_orders(null, $_GET["start"], $_GET["end"])
      : permision_denied_error();
    } else {
      $response = $_GET["student_id"] == $user->id
      ? get_orders($user->id, $_GET["start"], $_GET["end"])
      : permision_denied_error();
    }
  } elseif ($resource_id == "items") {
    $response = get_shop_items();
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
  $resource_id = $_POST["rid"];

  if ($resource_id == "orders") {
    $order = $_POST;
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
      } else {
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
        $response["error"] = get_db_error();
      }

  echo json_encode($response);
}
?>
