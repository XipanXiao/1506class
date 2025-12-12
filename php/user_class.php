<?php
include_once "config.php";
include_once "connection.php";
include_once "tables.php";
include_once "util.php";
include_once 'permission.php';

// function create_table_if_not_exists() {
//     global $medoo;
//
//     // 1. Ensure the table exists
//     $medoo->query("
//         CREATE TABLE IF NOT EXISTS user_classes (
//             user_id INT NOT NULL,
//             class_id INT NOT NULL,
//             PRIMARY KEY(user_id, class_id),
//             FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
//             FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
//         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
//     ");
// }
//
// function propagate_duplicate_user_classes($base_email) {
//     global $medoo;
//
//     create_table_if_not_exists();
//
//     // 2. Find all users matching the email pattern
//     $users = $medoo->select("users", ["id", "email", "classId"], [
//         "email[~]" => $base_email   // LIKE '%test@example.com'
//     ]);
//
//     if (empty($users)) return;
//
//     // 3. Collect all class_ids
//     $all_class_ids = [];
//     foreach ($users as $u) {
//         $all_class_ids[] = $u["classId"];
//     }
//     $all_class_ids = array_unique($all_class_ids);
//
//     // 4. Insert every class_id for every user
//     foreach ($users as $u) {
//         foreach ($all_class_ids as $cid) {
//             // Skip if already exists
//             $exists = $medoo->has("user_classes", [
//                 "user_id" => $u["id"],
//                 "class_id" => $cid
//             ]);
//             if (!$exists) {
//                 $medoo->insert("user_classes", [
//                     "user_id" => $u["id"],
//                     "class_id" => $cid
//                 ]);
//             }
//         }
//     }
// }

function get_duplicate_users($base_email) {
    global $medoo;

    return $medoo->select("users", ["id", "email", "classId"], [
        "email[~]" => strip_graduated_email_prefix($base_email)
    ]);
}

function get_user_classes($user_id, $email) {
    global $medoo;

    // Step 1: Find all user accounts that correspond to the same real person
    $users = get_duplicate_users($email);

    if (empty($users)) {
        return [];
    }

    // Step 2: Collect their classId values
    $class_ids = array_unique(
        array_map(fn($u) => intval($u["classId"]), $users)
    );

    if (empty($class_ids)) {
        return [];
    }

    // Step 3: Return class details (skip deleted classes)
    return $medoo->select("classes", ["id", "name"], [
        "id" => $class_ids,
        "deleted" => 0
    ]);
}
?>
