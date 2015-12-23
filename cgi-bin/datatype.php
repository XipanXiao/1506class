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
	public $street;
	public $im;
	public $classId;
	public $mentor;
	public $permission;
	public $notes;
	
	// Redundant fields.
	public $classInfo;
	
	public function __construct($row) {
		$this->id = intval($row["id"]);
		$this->internalId = $row['internal_id'];
		$this->name = $row['name']; 
		$this->password = $row['password']; 
		$this->sex = intval($row['sex']); 
		$this->nickname = $row['nickname']; 
		$this->email = $row['email']; 
		$this->phone = $row['phone']; 
		$this->street = $row['street']; 
		$this->im = $row['im']; 
		$this->classId = intval($row['class_id']); 
		$this->mentor = intval($row['mentor_id']); 
		$this->permission = intval($row['permission']); 
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
	public $department_id;
	public $name;
	public $teacherId;
	public $startYear;
}
?>
