<?php
   include_once 'config.php';
   include_once 'medoo.php';
 
   use Medoo\Medoo;


  function get_connection() {
     global $config;
    // Create connection
    $conn = new mysqli ( $config->servername, $config->username, 
      $config->password, $config->dbname );
    
    // Check connection
    if ($conn->connect_error) {
      error_log("Connection failed". $conn->connect_error);
      die ( "Connection failed: " . $conn->connect_error );
    }
    
    return $conn;
  }

  class MyMedoo extends Medoo {
    public function update2(string $table, $data, $where = null) {
        $rows = parent::update($table, $data, $where);
        return $rows ? $rows->rowCount() : 0;
    }

    public function insert2(string $table, array $values, string $primaryKey = null) {
        if (!parent::insert($table, $values, $primaryKey)) return 0;
        return parent::id();
    }
  }

  function get_medoo($charset = NULL) {
     global $config;
    
    return new MyMedoo([
        // required
        'database_type' => 'mysql',
        'database_name' => $config->dbname,
        'server' => $config->servername,
        // 'socket' => $config->socket,
        'username' => $config->username,
        'password' => $config->password,
        'charset' => $charset == NULL ? 'utf8' : $charset,
        
        // driver_option for connection, read more from http://www.php.net/manual/en/pdo.setattribute.php
        'option' => [
            PDO::ATTR_CASE => PDO::CASE_NATURAL
        ]
    ]);    
  }
?>
