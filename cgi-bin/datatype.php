<?php
class User {
	// Database fields.
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
	
	// Redundant fields.
	public $className;
	
	public function __construct($row) {
		$this->id = $row["id"];
		$this->internalId = $row['internal_id'];
		$this->name = $row['name']; 
		$this->password = $row['password']; 
		$this->sex = $row['sex']; 
		$this->nickname = $row['nickname']; 
		$this->email = $row['email']; 
		$this->phone = $row['phone']; 
		$this->address = $row['address']; 
		$this->yy = $row['yy']; 
		$this->qq = $row['qq']; 
		$this->wechat = $row['wechat']; 
		$this->classId = $row['class_id']; 
		$this->mentor = $row['mentor_id']; 
		$this->response = $row['response']; 
		$this->permission = $row['permission']; 
		$this->notes = $row['notes']; 
	}
	
	public function toArray() {
		$row = array();

		$row["id"] = $this->id;
		$row['internal_id'] = $this->internalId;
		$row['name'] = $this->name;
		$row['password'] = $this->password;
		$row['sex'] = $this->sex;
		$row['nickname'] = $this->nickname;
		$row['email'] = $this->email;
		$row['phone'] = $this->phone;
		$row['address'] = $this->address;
		$row['yy'] = $this->yy;
		$row['qq'] = $this->qq;
		$row['wechat'] = $this->wechat;
		$row['class_id'] = $this->classId;
		$row['mentor_id'] = $this->mentor;
		$row['response'] = $this->response;
		$row['permission'] = $this->permission;
		$row['notes'] = $this->notes;
		
		return $row;
	}
}

class ClassInfo {
	public $id;
	public $name;
	public $teacherId;
	public $startDate;
	public $endDate;
}

class ActionType {
	public $name;

	// 0: number, 1: boolean.
	public $value_type;
}
?>
