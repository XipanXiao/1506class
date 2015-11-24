 <?php
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
?>
