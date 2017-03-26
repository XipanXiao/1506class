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
  	  	description VARCHAR(64) COLLATE utf8_unicode_ci
	  		)");
	  if (empty($result)) {
	  	error_log($medoo->error());
	  	return false;
	  }
	  $medoo->insert($name, 
	  		["category" => 1, "price" => 23.0, "name" => "预科系入行论教材"]);
	  $medoo->insert($name, 
	  		["category" => 1, "price" => 22.0, "name" => "预科系加行教材"]);
	  $medoo->insert($name, 
	  		["category" => 1, "price" => 21.0, "name" => "预科系净土教材"]);
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
	$items = $medoo->select("order_details", "*", ["order_id" => $id]);
	$order["items"] = $items;
	
	$total = 0.0;
	foreach ($items as $item) {
		$total += $item["price"] * $item["count"];
	}

	$order["total"] = $total;
	return $order;
}

function get_orders($user_id, $start_timestamp, $end_timestamp) {
	global $medoo;
	
	return $medoo->select("orders", "*", ["AND" => 
			[
					"user_id" => $user_id, 
					"created_time[><]" => [$start_timestamp, $end_timestamp]
			]
	]);
}

function place_oder($user_id, $order) {
	global $medoo;

	$id = $medoo->insert("orders", ["user_id" => $user_id]);
	if (!$id) return false;

	foreach ($order["items"] as $item) {
		$item["order_id"] = $id;
		$medoo->insert("order_details", $item);
	}
	return $id;
}
?>
