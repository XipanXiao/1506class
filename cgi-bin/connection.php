 <?php
 	include_once 'config.php';
 	include_once 'medoo.php';
 
	function get_connection() {
 		global $config;
		// Create connection
		$conn = new mysqli ( $config->servername, $config->username, 
			$config->password, $config->dbname );
		
		// Check connection
		if ($conn->connect_error) {
			die ( "Connection failed: " . $conn->connect_error );
		}
		
		return $conn;
	}
	
	function get_medoo() {
 		global $config;
		
		return new medoo([
				// required
				'database_type' => 'mysql',
				'database_name' => $config->dbname,
				'server' => $config->servername,
				'username' => $config->username,
				'password' => $config->password,
		
				// driver_option for connection, read more from http://www.php.net/manual/en/pdo.setattribute.php
				'option' => [
						PDO::ATTR_CASE => PDO::CASE_NATURAL
				]
		]);		
	}
?>
