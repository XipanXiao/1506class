 <?php
 require 'medoo.php';
	$config = null;
	
	read_config();
 
 	function read_config() {
 		global $config;
 		
 		if ($config) {
 			return $config;
 		}
 		
 		if (isset($_SESSION['config'])) {
 			$config = unserialize($_SESSION['config']);
 			return $config;
 		}
 		
 	 	$config = json_decode(file_get_contents('../data/config.php'));
 	 	
 		$test = ($_SERVER['HTTP_HOST'] == 'localhost');

 		if ($test) {
 			$config = $config->test;
 		} else {
 			$config = $config->production;
 			session_save_path($config->session_path);
 		}
 		
 		if (empty(session_id())) {
 			session_start();
 			$_SESSION['config'] = serialize($config);
 		}
 		
 		return $config;
 	}
 
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
