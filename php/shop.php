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
  /// Paid but not shipped.
  const PAID = 2;
  /// Shipped and paid, no further actions are needed.
  const COMPLETED = 3;
  /// Closed (the same as completed, but will not seen by the client).
  const CLOSED = 7;
  /// Purchase order.
  const PURCHASE = 8;
  
  static function fromString($value) {
    $map = ["CREATED" => 0, "SHIPPED" => 1, "PAID" => 2, "COMPLETED" => 3];
    return $map[$value];
  }
}

/// Checks whether we can close an order (shipped and paided).
function _canClose($order) {
  return $order["status"] == OrderStatus::COMPLETED;
}

/// Returns an array of class ID's that can be read by [$user].
function _getManagedClasses($user) {
  if (isYearLeader($user)) {
    global $medoo;
    return $medoo->select("classes", "id",
        ["start_year" => $user->classInfo["start_year"]]);
  }
  if (isClassReader($user, $user->classId)) return $user->classId;
  return null;
}

/// Returns department level.
function _getDepartmentLevel($user) {
  global $medoo;
  
  $departments = keyed_by_id($medoo->select("departments", ["id", "level"]));
  $department = $departments[$user->classInfo["department_id"]];
  return $department ? $department["level"] : 0;
}

function _getDistrictClasses($district) {
  global $medoo;

  return $medoo->select("classes", "id", ["district" => $district]);
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
  
  $timeFilter = empty($filters["year"])
      ? "TRUE"
      : sprintf("YEAR(created_time)='%d'", $filters["year"]);
  $statusFilter = isset($filters["status"]) && $filters["status"] != ""
      ? sprintf("status = %d", intval($filters["status"]))
      : sprintf("status != %d", OrderStatus::CLOSED);
  $userFilter = $user_id ? sprintf("user_id=%d", $user_id) : "TRUE";
  $classFilter = "TRUE";
  if (!$user_id && !empty($filters["class_id"])) {
    $classIds = $filters["class_id"];
    if (is_string($classIds)) {
      $classIds = explode(",", $classIds);
    }
    $userIds = $medoo->select("users", "id", 
        ["classId" => $classIds]);
    $classFilter = sprintf("user_id in (%s)", join(", ", $userIds));
  }
  $districtFilter = empty($filters["district"])
      ? "TRUE"
      : sprintf("district=%d", $filters["district"]);
  
  $fields = ["id", "user_id", "status", "sub_total", "paid", "shipping",
      "int_shipping", "shipping_date", "paid_date", "created_time", "name",
      "paypal_trans_id", "usps_track_id", "class_name", "district", "comment",
      "shipping_donation"];
  $address_fields = 
      ["phone", "email", "street", "city", "state", "country", "zip"];
  
  if ($withAddress) {
    $fields = array_merge($fields, $address_fields);
  }
  
  $sql = sprintf("SELECT %s FROM orders WHERE (%s) AND (%s) AND (%s) AND (%s) AND (%s);",
  		join(", ", $fields),
  		$userFilter,
  		$statusFilter,
  		$timeFilter,
      $classFilter,
      $districtFilter
    );

  $orders = $medoo->query($sql)->fetchAll();
  if (!$withItems) return $orders;

  foreach ($orders as $index => $order) {
    $order["items"] = $medoo->select("order_details", "*", 
        ["order_id" => $order["id"]]);
    $orders[$index] = $order;
  }
  return $orders;
}

function increase_stock($medoo, $item, $district, $sign = 1) {
  $change = intval($item["count"]) * $sign;
  $medoo->update2("items", ["stock[+]" => $change], ["id" => $item["item_id"]]);

  $data = ["item_id" => $item["item_id"], "district" => $district];
  $inventories = $medoo->select("inventory", "*", ["AND" => $data]);

  if (empty($inventories)) {
    $data["stock"] = $change;
    return $medoo->insert("inventory", $data);
  } else {
    return $medoo->update2("inventory", ["stock[+]" => $change], ["AND" => $data]);
  }
}

/// Increases (or optionally decreases if [$sign] is negative) 
/// [$district] inventories for all items in the `order_details`
/// table selected by the [$where] condition.
function increase_stocks($medoo, $where, $district, $sign = 1) {
  $items = $medoo->select("order_details", ["item_id", "count"], $where);
  foreach ($items as $item) {
    if (!increase_stock($medoo, $item, $district, $sign)) return false;
  }
  return true;
}

function place_order($medoo, $order) {
  if (isset($order["items"])) {
    $items = $order["items"];
    unset($order["items"]);
  }

  $order = array_merge($order, sanitize_address());
  $id = $medoo->insert("orders", $order);
  if (!$id || empty($items)) return $id;

  foreach ($items as $item) {
    unset($item["id"]);
    $item["order_id"] = $id;
    $medoo->insert("order_details", $item);
  }
  $order = get_single_record($medoo, "orders", $id);
  if (!increase_stocks($medoo, ["order_id" => $id], $order["district"], -1)) {
    return false;
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

  $order = get_single_record($medoo, "orders", $id);
  if (empty($order)) return 0;

  increase_stocks($medoo, ["order_id" => $id], $order["district"]);
  $medoo->delete("order_details", ["order_id" => $id]);
  return $medoo->delete("orders", ["id" => $id]);
}

function validate_order_post() {
  if (isset($_POST["usps_track_id"])) {
    $_POST["usps_track_id"] = filter_input(INPUT_POST, "usps_track_id",
        FILTER_VALIDATE_REGEXP,
        ["options" => ["regexp" => "/\b[\dA-Z]+\b/"]]);
  }
  if (isset($_POST["paid"])) {
    $_POST["paid"] = filter_input(INPUT_POST, "paid", FILTER_VALIDATE_FLOAT);
  }
  if (isset($_POST["paypal_trans_id"])) {
    $_POST["paypal_trans_id"] = filter_input(INPUT_POST, "paypal_trans_id",
        FILTER_VALIDATE_REGEXP,
        ["options" => ["regexp" => "/\b[\dA-Z]{17}\b/"]]);
  }
}

function update_order($medoo, $order, $is_manager) {
  $data = build_update_data(
      ["paid", "paypal_trans_id", "paid_date", "comment"], $order);
  if ($is_manager) {
    $data = array_merge($data, build_update_data(["status", "shipping",
        "int_shipping", "sub_total", "usps_track_id", "district",
        "shipping_donation"], $order));

    if (!empty($order["district"])) {
      $old = get_single_record($medoo, "orders", $order["id"]);
      if (empty($old)) return 0;

      if (intval($old["district"]) != intval($order["district"])) {
        // Increase stock for the old district since the order is moved.
        if (!increase_stocks($medoo, ["order_id" => $order["id"]], $old["district"])) {
          return 0;
        }
        // Decrease stock for the new distrcit where the order is moving to.
        if (!increase_stocks($medoo, ["order_id" => $order["id"]], $order["district"], -1)) {
          return 0;
        }
      }
    }  
  } else if (isset($data["paid"]) &&
      (intval($order["status"]) & OrderStatus::PAID)) {
    $data["status"] = $order["status"];
  }
  
  if (!empty($data["paid"]) && empty($data["paid_date"])) {
    $data["#paid_date"] = "CURDATE()";
  }

  return $medoo->update2("orders", $data, ["id" => $order["id"]]);
}

function sanitize_address() {
  if (isset($_POST["country"]) &&
      !is_country_code($_POST["country"])) return null;

  $data = [];
  foreach (["name", "phone", "street", "city", "zip"] as $key) {
    $data[$key] = filter_input(INPUT_POST, $key, FILTER_SANITIZE_STRING,
        FILTER_REQUIRE_SCALAR);
  }
  return $data;
}

function get_shop_items($category, $level) {
  global $medoo;

  $filters = null;
  if ($category) {
    $filters = ["category" => $category]; 
  }

  if ($level != 99) {
    $categories = array_keys(get_item_categories($level));
    if ($category) {
      if (!array_search($category, $categories)) return [];
    } else {
      $filters = ["category" => $categories]; 
    }
  }

  return keyed_by_id($medoo->select("items", "*", $filters));
}

function get_item_categories($level) {
  global $medoo;

  if ($level == 99) {
    return keyed_by_id($medoo->select("item_categories", "*"));
  }
  return keyed_by_id($medoo->select("item_categories", "*", ["OR" => [
          "level" => $level, 
          "AND" => ["level[<=]" => $level, "shared" => 1]
      ]]));
}

function update_item($item) {
  global $medoo;

  $data = build_update_data(["id", "category", "deleted", "image",
      "int_shipping", "name", "price", "shipping"], $item);
  return insertOrUpdate($medoo, "items", $data);
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
    $first_order["int_shipping"] += $order["int_shipping"];
    $first_order["shipping_donation"] += $order["shipping_donation"];
    
    if ($medoo->update2("order_details", ["order_id" => $id], 
        ["order_id" => $order["id"]])) {
      $medoo->delete("orders", ["id" => $order["id"]]);    
    }
  }

  $data = ["sub_total" => $first_order["sub_total"], 
      "paid" => $first_order["paid"], 
      "shipping" => $first_order["shipping"],
      "int_shipping" => $first_order["int_shipping"],
      "shipping_donation" => $first_order["shipping_donation"]
  ];
  return ["updated" => $medoo->update2("orders", $data, ["id" => $id])];
}

/// Moves selected items from [$fromOrder] to [$toOrder].
///
/// "id", "sub_total", "int_shipping", "shipping" of both orders are required.
/// id, price, count, int_shipping, shipping of each item are required.  
function move_order_items($fromOrder, $toOrder) {
  global $medoo;

  if (!$fromOrder["id"] || !$toOrder["id"]) return 0;
  
  function selected($item) {
    return isset($item["selected"]) && $item["selected"];
  }
  $items = array_filter($fromOrder["items"], "selected");
  if (empty($items)) return 0;
  
  $updated = 0;
  function get_id($item) { return $item["id"]; }
  $updated = $medoo->update2("order_details", ["order_id" => $toOrder["id"]],
      ["id" => array_map("get_id", $items)]);
  if (!$updated) return 0;
  
  function get_total($total, $item) { 
    $total += intval($item["count"]) * floatval($item["price"]);
    return $total;
  }
  function get_int_shipping($shipping, $item) { 
    $shipping += intval($item["count"]) * floatval($item["int_shipping"]);
    return $shipping;
  }
  function get_shipping($shipping, $item) {
    $shipping += intval($item["count"]) * floatval($item["shipping"]);
    return $shipping;
  }
  $sub_total = array_reduce($items, "get_total", 0.0);
  $int_shipping = array_reduce($items, "get_int_shipping", 0.0);
  $shipping = array_reduce($items, "get_shipping", 0.0);
  
  $fromOrder["sub_total"] = floatval($fromOrder["sub_total"]) - $sub_total;
  $fromOrder["int_shipping"] = 
      floatval($fromOrder["int_shipping"]) - $int_shipping;
  $fromOrder["shipping"] = floatval($fromOrder["shipping"]) - $shipping;

  $toOrder["sub_total"] = floatval($toOrder["sub_total"]) + $sub_total;
  $toOrder["int_shipping"] =
      floatval($toOrder["int_shipping"]) + $int_shipping;
  $toOrder["shipping"] = floatval($toOrder["shipping"]) + $shipping;

  $grand = $sub_total + $int_shipping + $shipping;
  if (floatval($fromOrder["paid"]) > $grand) {
    $fromOrder["paid"] = floatval($fromOrder["paid"]) - $grand;
    $toOrder["paid"] = floatval($toOrder["paid"]) + $grand;
  }
  if (isset($fromOrder["paid_date"])) {
    $toOrder["paid_date"] = $fromOrder["paid_date"];
  }

  $updated += update_order($medoo, $fromOrder, TRUE);
  $updated += update_order($medoo, $toOrder, TRUE);
  return $updated;
}

function delete_order_item($id) {
  global $medoo;

  $item = get_single_record($medoo, "order_details", ["id" => $id]);
  if (empty($item)) return 0;

  $order = get_single_record($medoo, "orders", ["id" => $item["order_id"]]);
  increase_stock($medoo, $item, $order["district"]);
  return $medoo->delete("order_details", ["id" => $id]);
}

function get_book_list($dep_id, $term, $classId) {
  global $medoo;

  if (!$dep_id && !$term) {
    $classes = $medoo->select("classes", "*", ["id" => intval($classId)]);
    if (empty($classes)) return [];

    $classInfo = current($classes);
    $dep_id = $classInfo["department_id"];
    $term = $classInfo["term"];
  }
  return $medoo->select("book_lists", "item_id", ["AND" =>
      ["department_id" => intval($dep_id), "term" => intval($term)]]);
}

function update_book_list($bookList) {
  global $medoo;

  $where = build_update_data(["department_id", "term"], $bookList);

  $updated = $medoo->delete("book_lists", ["AND" => $where]);
  if (empty($bookList["bookIds"])) return $updated;

  foreach ($bookList["bookIds"] as $bookId) {
    $data = array_merge([], $where, ["item_id" => $bookId]);
    $medoo->insert("book_lists", $data);
    $updated++;
  }
  return $updated;
}

function remove_book_list($depId, $term) {
  global $medoo;

  return $medoo->delete("book_lists",
      ["AND" => ["department_id" => $depId, "term" => $term]]);
}

function get_class_book_lists($year) {
  global $medoo;

  return keyed_by_id($medoo->select("classes", ["id", "name",
    "department_id", "term", "start_year"], ["AND" => [
      "start_year" => $year,
      "deleted[!]" => 1,
      "graduated[!]" => 1,
      "department_id[!]" => 9
    ]]));
}

function update_class_term($classInfo) {
  global $medoo;

  return $medoo->update2("classes", ["term" => intval($classInfo["term"])],
      ["id" => intval($classInfo["id"])]);
}

function get_requested_level($user, $request) {
  if (!is_numeric($request["level"])) return _getDepartmentLevel($user);

  $requestedLevel = intval($request["level"]);
  return isOrderManager($user)
      ? $requestedLevel
      : min([_getDepartmentLevel($user), $requestedLevel]);
}

function get_inventory($district) {
  global $medoo;

  $where = $district ? ["district" => $district] : null;
  return keyed_by_id($medoo->select("inventory", "*", $where),
      "item_id");
}

function move_inventory($medoo, $item, $from, $to) {
  $updated = increase_stock($medoo, $item, $from, -1);
  if (!$updated) return 0;
  return $updated + increase_stock($medoo, $item, $to, +1);
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
      } elseif (canReadOrder($user, $order)) {
        $response = $order;
      } else {
        $response = permission_denied_error();
      }
    } elseif (empty($_GET["student_id"])) {
      if (isOrderReader($user)) {
        $response = get_orders(null, $_GET, $_GET["items"], 
            canReadOrderAddress($user));
      } elseif (isDistrictInspector($user)) {
        $classIds = _getDistrictClasses($user->district);
        $response = $classIds ? get_orders(null, 
            array_merge($_GET, ["class_id" => $classIds]), 
            $_GET["items"],
            TRUE) : permission_denied_error();
      } else {
        $classIds = _getManagedClasses($user);
        $response = $classIds ? get_orders(null, 
            array_merge($_GET, ["class_id" => $classIds]), 
            $_GET["items"],
            TRUE) : permission_denied_error();
      }
    } else {
      $response = $_GET["student_id"] == $user->id
      ? get_orders($user->id, $_GET, $_GET["items"], true)
      : permission_denied_error();
    }
  } elseif ($resource_id == "items") {
    $level = get_requested_level($user, $_GET);
    $response = get_shop_items($_GET["category"], $level);
  } elseif ($resource_id == "item_categories") {
    $response = get_item_categories(get_requested_level($user, $_GET));
  } elseif ($resource_id == "order_stats") {
    $response = isOrderReader($user) 
        ? get_order_stats($_GET["year"]) 
        : permission_denied_error();
  } elseif ($resource_id == "book_lists") {
    $response = get_book_list($_GET["dep_id"], $_GET["term"], $user->classId); 
  } elseif ($resource_id == "class_book_lists") {
    $response = isOrderReader($user) 
        ? get_class_book_lists($_GET["year"]) 
        : permission_denied_error();
  } elseif ($resource_id == "inventory") {
    $response = isOrderManager($user)
      ? get_inventory($_GET["district"])
      : permission_denied_error();
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
  $resource_id = $_POST["rid"];
  unset($_POST["rid"]);
  
  if ($resource_id == "orders") {
    $order = $_POST;
    validate_order_post();

    if (!canWriteOrder($user, $order)) {
      $response = permission_denied_error();
    } elseif (empty($order["id"])) {
      if (empty($order["class_name"])) {
        $order["class_name"] = $user->classInfo["name"];
      }
      $medoo->action(function($medoo) {
        global $order, $response;
        $updated = place_order($medoo, $order);
        $response = ["updated" => $updated];
        return $updated;
      });
    } else {
      $medoo->action(function($medoo) {
        global $order, $user, $response;
        $updated = update_order($medoo, $order, isOrderManager($user));
        $response = ["updated" => $updated];
        return $updated;
      });
    }
  } elseif ($resource_id == "move_items") {
    $response = isOrderManager($user)
      ? ["updated" => 
          move_order_items($_POST["from_order"], $_POST["to_order"])]
      : permission_denied_error();
  } elseif ($resource_id == "book_lists") {
    $response = isOrderManager($user)
      ? ["updated" => update_book_list($_POST)]
      : permission_denied_error();
  } elseif ($resource_id == "class_book_lists") {
    $response = isOrderManager($user)
      ? ["updated" => update_class_term($_POST)]
      : permission_denied_error();
  } elseif ($resource_id == "items") {
    $response = isOrderManager($user)
        ? ["updated" => update_item($_POST)]
        : permission_denied_error();
  } elseif ($resource_id == "move_inventory") {
    $medoo->action(function($medoo) {
      global $user, $response;
      $response = isOrderManager($user)
          ? ["updated" => move_inventory($medoo, $_POST["item"], 
              $_POST["from_district"], $_POST["to_district"])]
          : permission_denied_error();
    });
  }
} elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE" &&
    isset ( $_REQUEST["rid"] )) {

  $resource_id = $_REQUEST["rid"];

  $record = get_single_record($medoo, $resource_id, $_REQUEST["id"]);
  error_log($user->email ." DELETE ". json_encode($record));
  if ($resource_id == "orders") {
    if (!canWriteOrder($user, $record)) {
      $response = permission_denied_error();
    } elseif (floatval($record["paid"]) >= 0.01 || 
        !empty($record["paypal_trans_id"]) || 
        !empty($record["usps_track_id"])) {
      $response = ["error" => "order is paid or shipped"];
    } else {
      $response = ["deleted" => delete_order($_REQUEST["id"])];
    }
  } elseif ($resource_id == "order_details") {
    $response = ["deleted" => delete_order_item($_REQUEST["id"])];
  } elseif ($resource_id == "book_lists") {
    $response = 
        ["deleted" => remove_book_list($_REQUEST["dep_id"], $_REQUEST["term"])];
  } elseif ($resource_id == "book_list_details") {
    $response = ["deleted" => remove_list_detail($_REQUEST["id"])];
  } elseif ($resource_id == "class_book_lists") {
    $response = ["deleted" => remove_class_book_list($_REQUEST["id"])];
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
