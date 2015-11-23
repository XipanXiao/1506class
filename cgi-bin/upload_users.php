<html>
<head>
<meta charset="UTF-8">
<title>Upload users</title>
</head>

<body>

<?php
    include "user.php";
    include "connection.php";
    
    function prepare_statement($conn, $user) {
        $sql = "INSERT INTO students(internalId, name, sex, nickname, email," .
            "phone, Address, yy, qq, wechat, classId, mentor, response, permission," .
            "notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        if (!($stmt = $conn->prepare($sql))) {
            echo "Prepare failed: (" . $conn->errno . ") " . $conn->error;
            return $stmt;
        }

        $stmt->bind_param("ssisssssssissis", $user->id, $user->name, $user->sex,
            $user->nickname, $user->email, $user->phone, $user->address, $user->yy,
            $user->qq, $user->wechat, $user->classId, $user->mentor, $user->response,
            $user->permission, $user->notes);
        return $stmt;
    }
    
    function parseUser($user, $str) {
        echo "Parsing ". $str. "<BR>";
        $fields = explode(",", $str);
        
        $length = sizeof($fields);
        
        if ($length < 8) {
            echo "Length is ". $length. "<BR>";
            return false;
        }

        $user->id = $fields[1];
        $user->name = $fields[2];
        $user->sex = ($fields[3] == "男");
        $user->phone = $fields[4];
        $user->email = $fields[5];
        $user->address = $fields[8];
        
        if ($length > 11) {
            $user->mentor = $fields[11];
        }
        
        return true;
    }
    
    function create_users($filename) {
        $user = new User();
        $user->permission = 1;
        
        $conn = get_connection();
        if (!($stmt = prepare_statement($conn, $user))) {
            return;
        }
        
        $handle = fopen($filename, "r");

        if (!$handle) {
            echo "Failed to read uploaded file ", $filename;
            return;
        }
        
        // Skip the header.
        fgets($handle);
            
        while (($line = fgets($handle)) !== false) {
            if(parseUser($user, $line) && $stmt->execute()) {
                echo "Created student record for " . $user->name. "<BR";
            };
        }
            
        fclose($handle);
        $stmt->close();
        $conn->close();
    }

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["submit"])) {
    create_users($_FILES["students"]["tmp_name"]);
} else {
?>
    <form method="POST" enctype="multipart/form-data">
        Select students record (*.csv) to upload:
        <input type="file" name="students" id="students">
        <input type="submit" name="submit">
    </form>

<?php
}
?>
</body>
</html>
