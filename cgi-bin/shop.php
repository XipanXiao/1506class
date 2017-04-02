<?php
/// 订书模块
include_once "datatype.php";
include_once "connection.php";
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
      error_log($medoo->error());
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
        description VARCHAR(64) COLLATE utf8_unicode_ci
        )");
    if (empty($result)) {
      error_log($medoo->error());
      return false;
    }
    $medoo->insert($name, 
        ["category" => 1, "price" => 23.0, "name" => "预科系入行论教材", 
            "image" => "images/ruxinglun.jpg"]);
    $medoo->insert($name, 
        ["category" => 1, "price" => 22.0, "name" => "预科系加行教材", 
            "image" => "images/jiaxing.jpg"]);
    $medoo->insert($name, 
        ["category" => 1, "price" => 21.0, "name" => "预科系净土教材", 
            "image" => "images/jingtu.jpg"]);
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
          ON UPDATE CURRENT_TIMESTAMP,
        )");
    if (empty($result)) {
      error_log($medoo->error());
      return false;
    }
  }
  
  $name = "closed_orders";
  if (!table_exists($medoo, $name)) {
    $result = $medoo->query("CREATE TABLE ". $name. 
        " SELECT * FROM orders LIMIT 0");
      if (empty($result)) {
      error_log($medoo->error());
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
        count MEDIUMINT NOT NULL DEFAULT (1)
      )");
    if (empty($result)) {
      error_log($medoo->error());
      return false;
    }
  }

  $name = "closed_order_details";
  if (!table_exists($medoo, $name)) {
    $result = $medoo->query("CREATE TABLE ". $name. 
        " SELECT * FROM order_details LIMIT 0");
      if (empty($result)) {
      error_log($medoo->error());
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
?>
