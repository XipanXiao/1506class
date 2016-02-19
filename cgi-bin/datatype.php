<?php
class User {
	public function __construct($row) {
    $int_fields = ["sex", "mentor_id", "permission", "education", "start_year",
        "classId", "volunteer", "channel"];
		foreach ($row as $key => $value) {
	  	$this->$key = in_array($key, $int_fields) ? intval($value) : $value;
	  }
	}
}
?>
