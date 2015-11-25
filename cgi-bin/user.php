<?php
class User {
	public $id;
	public $name;
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
}

class ClassInfo {
	public $id;
	public $name;
	public $teacherId;
}

class ActionType {
	public $name;

	// 0: number, 1: boolean.
	public $value_type;
}
?>
