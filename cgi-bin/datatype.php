<?php
class User {
	// Database fields.
	public $id;
	public $internal_id;
	public $start_year;
	public $name;
	public $password;
	public $sex;
	public $nickname;
	public $email;
	public $phone;
	public $street;
	public $im;
	public $classId;
	public $education;
	public $occupation;
	public $mentor_id;
	public $permission;
	public $notes;
	
	// Redundant fields.
	public $classInfo;
	
	public function __construct($row) {
		$this->id = intval($row["id"]);
		$this->internal_id = $row['internal_id'];
		$this->start_year = $row['start_year'];
		$this->name = $row['name']; 
		$this->password = $row['password']; 
		$this->sex = intval($row['sex']); 
		$this->nickname = $row['nickname']; 
		$this->email = $row['email']; 
		$this->phone = $row['phone']; 
		$this->street = $row['street']; 
		$this->street2 = $row['street2']; 
		$this->city = $row['city']; 
		$this->state = $row['state']; 
		$this->zip = $row['zip']; 
		$this->birthday = $row['birthday']; 
		$this->im = $row['im']; 
		$this->classId = intval($row['classId']); 
		$this->education = intval($row['education']); 
		$this->occupation = $row['occupation']; 
		$this->mentor_id = intval($row['mentor_id']); 
		$this->permission = intval($row['permission']); 
		$this->notes = $row['notes']; 
	}
	
	public function toArray() {
		$row = array();

		$row["id"] = $this->id;
		$row['internal_id'] = $this->internal_id;
		$row['start_year'] = $this->start_year;
		$row['name'] = $this->name;
		$row['password'] = $this->password;
		$row['sex'] = $this->sex;
		$row['nickname'] = $this->nickname;
		$row['email'] = $this->email;
		$row['phone'] = $this->phone;
		$row['street'] = $this->street; 
		$row['street2'] = $this->street2; 
		$row['city'] = $this->city; 
		$row['state'] = $this->state; 
		$row['zip'] = $this->zip; 
		$row['birthday'] = $this->birthday; 
		$row['yy'] = $this->yy;
		$row['qq'] = $this->qq;
		$row['wechat'] = $this->wechat;
		$row['classId'] = $this->classId;
		$row['education'] = $this->education; 
		$row['occupation'] = $this->occupation; 
		$row['mentor_id'] = $this->mentor_id;
		$row['response'] = $this->response;
		$row['permission'] = $this->permission;
		$row['notes'] = $this->notes;
		
		return $row;
	}
}
?>
