<?php
	// This file must be include first if session is needed since it
	// outputs a cookie to the header.
	$config = null;
	
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
 		
 		session_start();
 		return $config;
 	}

 	read_config();
?>
