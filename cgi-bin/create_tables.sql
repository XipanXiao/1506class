drop database if exists buddcourses;
CREATE DATABASE buddcourses;
USE buddcourses;

-- group 1: 基础班
-- group 2: 入行论班
-- group 3: 加行班
-- group 4: 净土班
CREATE TABLE class_groups (
                          id TINYINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                          group_name VARCHAR(32)
                          );
INSERT INTO class_groups(group_name) VALUES ("基础班");
INSERT INTO class_groups(group_name) VALUES ("入行论班");
INSERT INTO class_groups(group_name) VALUES ("加行班");
INSERT INTO class_groups(group_name) VALUES ("净土班");

-- id = (group_id << 16) | task_id)
CREATE TABLE tasks (
                      id INT NOT NULL PRIMARY KEY,
                      name VARCHAR(32)
                      );
INSERT INTO tasks(id, name) VALUES ((3 << 16) | 1, "顶礼");
INSERT INTO tasks(id, name) VALUES ((3 << 16) | 2, "金刚萨埵心咒");

-- id = (group_id << 16) | class_id)
CREATE TABLE classes (
                      id INT NOT NULL PRIMARY KEY,
                      name VARCHAR(32),
                      email VARCHAR(32),
                      class_room VARCHAR(16),
					  teacher_id INT,
					  start_date DATETIME,
					  end_date DATETIME
                      );
INSERT INTO classes(id, name, class_room, email, start_date, end_date) VALUES ((2 << 16) | 1, "入行论（周四）", "99343758", "", "2015-12-3 18:00:00", "2019-12-3 18:00:00");
INSERT INTO classes(id, name, class_room, email, start_date, end_date) VALUES ((2 << 16) | 2, "入行论（周六）", "99343758", "", "2015-12-5 18:00:00", "2019-12-3 18:00:00");
INSERT INTO classes(id, name, class_room, email, start_date, end_date) VALUES ((3 << 16) | 1, "加行（周二）", "99343758", "", "2015-12-1 18:00:00", "2019-12-3 18:00:00");
INSERT INTO classes(id, name, class_room, email, start_date, end_date) VALUES ((3 << 16) | 2, "加行（周四）", "99343758", "1506jiaxing@googlegroups.com", "2015-12-3 18:00:00", "2019-12-3 18:00:00");
INSERT INTO classes(id, name, class_room, email, start_date, end_date) VALUES ((3 << 16) | 3, "加行（周六）", "99343758", "1506zhangfan@googlegroups.com", "2015-12-3 18:00:00", "2019-12-3 18:00:00");
INSERT INTO classes(id, name, class_room, email, start_date, end_date) VALUES ((4 << 16) | 1, "净土（周一）", "99343758", "", "2015-11-30 18:30:00", "2019-12-3 18:00:00");

-- id = (group_id << 16) | course_group_id)
CREATE TABLE course_groups(
      id INT NOT NULL PRIMARY KEY,
      name VARCHAR(64),
      url VARCHAR(512)
);
INSERT INTO course_groups(id, name, url) VALUES((3 << 16) | 1, "前行广释", "http://www.zhibeifw.com/cmsc/list.php?fid=70");
INSERT INTO course_groups(id, name, url) VALUES((2 << 16) | 1, "入行论", "http://www.zhibeifw.com/cmsc/list.php?fid=77");

CREATE TABLE courses (
                      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                      course_group_id INT,
                      course_name VARCHAR(64),
                      video_url VARCHAR(512),
                      text_url VARCHAR(512)
                      );
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行之重要性", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=756&id=770", "http://www.zhibeifw.com/down/videodymqx/qxzzyx.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "《上师瑜伽速赐加持》讲记", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=132&id=725", "http://www.zhibeifw.com/down/doc/201101110003.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第1课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=756&id=957", "http://www.zhibeifw.com/down/videodymqx/dymqxgs001.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第2课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=756&id=2", "http://www.zhibeifw.com/down/videodymqx/dymqxgs002.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第3课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=3", "http://www.zhibeifw.com/down/videodymqx/dymqxgs003.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第4课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=4", "http://www.zhibeifw.com/down/videodymqx/dymqxgs004.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第5课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=5", "http://www.zhibeifw.com/down/videodymqx/dymqxgs005.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第6课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=6", "http://www.zhibeifw.com/down/videodymqx/dymqxgs006.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第7课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=7", "http://www.zhibeifw.com/down/videodymqx/dymqxgs007.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第8课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第9课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第10课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第11课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第12课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第13课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第14课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第15课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第16课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第17课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第18课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第19课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第20课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 16) | 1, "前行广释第21课", "", "");

CREATE TABLE users(
			      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
			      internal_id VARCHAR(8),
			      name VARCHAR(32),
			      password VARCHAR(32),
			      sex BOOLEAN,
			      nickname VARCHAR(32),
			      email VARCHAR(32) NOT NULL,
			      phone VARCHAR(16),
			      address VARCHAR(64),
			      yy VARCHAR(16),
			      qq VARCHAR(16),
			      wechat VARCHAR(32),
			      class_id INT,
			      future_class_group TINYINT,
			      mentor_id INT,
			      response VARCHAR(16),
			      permission INT,
                  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			      notes VARCHAR(255));

CREATE TABLE schedules (
                      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
					  dt DATETIME,
					  class_id INT,
					  course_id INT,
					  open INT,
					  review INT
                      );
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-03 18:00:00", (3 << 16) | 2, 1, 2, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-10 18:00:00", (3 << 16) | 2, 2, 9, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-17 18:00:00", (3 << 16) | 2, 3, 3, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-24 18:00:00", (3 << 16) | 2, 0, 0, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-31 18:00:00", (3 << 16) | 2, 4, 10, 1);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-07 18:00:00", (3 << 16) | 2, 5, 5, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-14 18:00:00", (3 << 16) | 2, 6, 7, 6);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-21 18:00:00", (3 << 16) | 2, 7, 1, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-28 18:00:00", (3 << 16) | 2, 8, 19, 11);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-04 18:00:00", (3 << 16) | 2, 9, 6, 18);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-11 18:00:00", (3 << 16) | 2, 0, 15, 8);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-18 18:00:00", (3 << 16) | 2, 10, 11, 16);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-25 18:00:00", (3 << 16) | 2, 11, 18, 13);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-03 18:00:00", (3 << 16) | 2, 12, 8, 17);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-10 18:00:00", (3 << 16) | 2, 13, 16, 12);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-17 18:00:00", (3 << 16) | 2, 14, 13, 9);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-24 18:00:00", (3 << 16) | 2, 15, 17, 14);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-31 18:00:00", (3 << 16) | 2, 16, 12, 10);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-07 18:00:00", (3 << 16) | 2, 17, 9, 2);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-14 18:00:00", (3 << 16) | 2, 18, 14, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-21 18:00:00", (3 << 16) | 2, 19, 10, 3);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-28 18:00:00", (3 << 16) | 2, 20, 2, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-05 18:00:00", (3 << 16) | 2, 21, 7, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-12 18:00:00", (3 << 16) | 2, 22, 3, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-19 18:00:00", (3 << 16) | 2, 23, 19, 1);

CREATE TABLE task_records (
                 student_id INT not null,
                 task_id INT,
                 count MEDIUMINT, 
                 ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                 );
CREATE TABLE schedule_records (
                 student_id INT not null,
                 schedule_id INT,
                 attended BOOLEAN,
                 video BOOLEAN, 
                 text BOOLEAN, 
				 reading BOOLEAN,
                 ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                 );
