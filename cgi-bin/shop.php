<?php
/// 订书模块
include_once "datatype.php";
include_once "connection.php";
include_once "util.php";

$medoo = get_medoo();

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
        status TINYINT NOT NULL DEFAULT 1,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        extra_cost DECIMAL,
        created_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        )");
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

  $id = $medoo->insert("orders", ["user_id" => $order["user_id"]]);
  if (!$id) return false;

  foreach ($order["items"] as $item) {
    $item["order_id"] = $id;
    $medoo->insert("order_details", $item);
  }
  return $id;
}

function delete_order($id) {
  global $medoo;
  
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
