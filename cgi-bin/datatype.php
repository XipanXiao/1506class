<?php
class User {
	public $id;
	public $internalId;
	public $name;
	public $password;
	public $sex;
	public $nickname;
	public $email;
	public $phone;
	public $address;
	public $yy;
	public $qq;
	public $wechat;
	public $classId;
	public $mentor;
	public $response;
	public $permission;
	public $notes;
	
	public function __construct($row) {
		if (!$row || empty($row)) {
			return;
		}
		
		foreach ($row as $key => $value) {
			echo $key . ':'. $value . "<BR>";
		}
		
		$this->$id = $row["id"];
		$this->$internalId = $row['internal_id'];
		$this->$name = $row['name']; 
		$this->$password = $row['password']; 
		$this->$sex = $row['sex']; 
		$this->$nickname = $row['nickname']; 
		$this->$email = $row['email']; 
		$this->$phone = $row['phone']; 
		$this->$address = $row['address']; 
		$this->$yy = $row['yy']; 
		$this->$qq = $row['qq']; 
		$this->$wechat = $row['wechat']; 
		$this->$classId = $row['class_id']; 
		$this->$mentor = $row['mentor']; 
		$this->$response = $row['response']; 
		$this->$permission = $row['permission']; 
		$this->$notes = $row['notes']; 
	}
}

class ClassInfo {
	public $id;
	public $name;
	public $teacherId;
	public $startDate;
}

class ActionType {
	public $name;

	// 0: number, 1: boolean.
	public $value_type;
}
?>
