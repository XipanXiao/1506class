<?php
include_once "datatype.php";
include_once "connection.php";
include_once "permission.php";
include_once "util.php";

$medoo = get_medoo();

function setup_original_id_and_link_duplicates() {
    global $medoo;

    // 1. Check if original_id column exists
    $columnExists = $medoo->query("
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'users'
          AND COLUMN_NAME = 'original_id'
    ")->fetchColumn();

    // 2. If missing, add column (nullable INT with FK) and run linking
    if (!$columnExists) {
        // Add column and foreign key
        $medoo->query("
            ALTER TABLE users
                ADD COLUMN original_id INT NULL,
                ADD CONSTRAINT fk_users_original_id
                    FOREIGN KEY (original_id)
                    REFERENCES users(id)
                    ON DELETE SET NULL
                    ON UPDATE CASCADE
        ");

        // Populate original_id for duplicates
        link_duplicate_users();
    }
}

function link_duplicate_users() {
    global $medoo;

    $users = $medoo->select("users", ["id", "email"]);

    if (!$users) return;

    // 2. Group by base email
    $groups = [];
    foreach ($users as $u) {
        $base = strip_graduated_email_prefix($u["email"]);
        $groups[$base][] = $u;
    }

    // 3. Process each group
    foreach ($groups as $baseEmail => $group) {
        $baseUser = null;
        foreach ($group as $u) {
            if ($u["email"] == $baseEmail) {
                $baseUser = $u;
                break;
            }
        }

        if (!$baseUser) continue;
        $baseId = $baseUser["id"];

        foreach ($group as $u) {
            $uid = $u["id"];
            if ($uid != $baseId) {
                $medoo->update("users", ["original_id" => $baseId], ["id" => $uid]);
            }
        }
    }
}

/// Renames email of the user (identified by [$user_id]) to ['$newEmail'],
/// and registers a new user with the old (current) email.
function clone_user($user_id, $newEmail = null, $newClassId = null) {
  global $medoo;

  $user = get_single_record($medoo, "users", $user_id);
  if (!$user) return 0;

  $email = $newEmail ?: ($user["email"]. ".deleted");
  if (!$medoo->update2("users", ["email" => $email], ["id" => $user_id])) {
    return 0;
  }

  unset($user["id"]);
  unset($user["internal_id"]);
  unset($user["zb_id"]);
  if ($newClassId) {
    $user["classId"] = $newClassId;
  }
  setup_original_id_and_link_duplicates();
  $user["original_id"] = $user["original_id"] ?? $user_id;
  $newId = $medoo->insert2("users", $user);
  if (!$newId) {
    return 0;
  }

  if (!$newEmail) {
    remove_user($user_id);
  }

  $references = [
    "teacher_id" => "classes",
    "teacher2_id" => "classes",
    "teacher" => "schedules",
    "teacher_planned" => "schedules",
    "user" => "staff"
  ];

  foreach($references as $field => $table) {
    $medoo->update2($table, [$field => $newId], [$field => $user_id]);
  }
  return $newId;
}
?>
