 <?php
 require 'medoo.php';
 
	function get_connection() {
		$servername = 'localhost';
		$username = 'root';
		$password = '1234567890';
		
		// Create connection
		$conn = new mysqli ( $servername, $username, $password );
		
		// Check connection
		if ($conn->connect_error) {
			die ( "Connection failed: " . $conn->connect_error );
		}
		
		if (! $conn->select_db ( "buddcourses" )) {
			die ( "Failed to select database" . $conn->connect_error );
		}
		
		return $conn;
	}
	
	function get_medoo() {
		return new medoo([
				// required
				'database_type' => 'mysql',
				'database_name' => 'buddcourses',
				'server' => 'localhost',
				'username' => 'root',
				'password' => '1234567890',
				//'charset' => 'utf-8',
		
				// driver_option for connection, read more from http://www.php.net/manual/en/pdo.setattribute.php
				'option' => [
						PDO::ATTR_CASE => PDO::CASE_NATURAL
				]
		]);		
	}
?>
