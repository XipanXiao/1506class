drop database if exists buddcourses;
CREATE DATABASE buddcourses;
USE buddcourses;

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
			      class_id MEDIUMINT,
			      mentor VARCHAR(32),
			      response VARCHAR(16),
			      permission INT,
			      notes VARCHAR(255));

CREATE TABLE course_groups (
                          id TINYINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                          group_name VARCHAR(32)
                          );
INSERT INTO course_groups(group_name) VALUES ("基础班");
INSERT INTO course_groups(group_name) VALUES ("入行论班");
INSERT INTO course_groups(group_name) VALUES ("加行班");
INSERT INTO course_groups(group_name) VALUES ("净土班");

CREATE TABLE group_tasks (
                          id TINYINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                          group_id TINYINT,
                          task_name VARCHAR(32)
                          );
INSERT INTO group_tasks(group_id, task_name) VALUES (3, "金刚萨埵心咒");
INSERT INTO group_tasks(group_id, task_name) VALUES (3, "顶礼");

CREATE TABLE classes (
                      id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
					  group_id TINYINT, 
                      class_name VARCHAR(32),
                      class_room VARCHAR(16),
					  teacher_id INT,
					  start_date DATETIME
                      );
INSERT INTO classes(class_name, class_room, group_id, start_date) VALUES ("入行论（周四）", "99343758", 2, "2015-12-3 18:00:00");
INSERT INTO classes(class_name, class_room, group_id, start_date) VALUES ("入行论（周六）", "99343758", 2, "2015-12-5 18:00:00");
INSERT INTO classes(class_name, class_room, group_id, start_date) VALUES ("加行（周二）", "99343758", 3, "2015-12-1 18:00:00");
INSERT INTO classes(class_name, class_room, group_id, start_date) VALUES ("加行（周四）", "99343758", 3, "2015-12-3 18:00:00");
INSERT INTO classes(class_name, class_room, group_id, start_date) VALUES ("净土（周一）", "99343758", 4, "2015-11-30 18:30:00");

CREATE TABLE courses (
                      id TINYINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                      group_id TINYINT,
                      course_name VARCHAR(64)
                      );
INSERT INTO courses(group_id, course_name) VALUES (3, "前行之重要性");
INSERT INTO courses(group_id, course_name) VALUES (3, "《上师瑜伽速赐加持》讲记");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第1课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第2课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第3课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第4课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第5课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第6课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第7课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第8课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第9课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第10课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第11课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第12课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第13课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第14课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第15课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第16课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第17课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第18课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第19课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第20课");
INSERT INTO courses(group_id, course_name) VALUES (3, "前行广释第21课");

CREATE TABLE schedules (
                      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
					  dt DATETIME,
					  class_id TINYINT,
					  course_id TINYINT
                      );
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2015-12-03 18:00:00", 4, 1);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2015-12-10 18:00:00", 4, 2);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2015-12-17 18:00:00", 4, 3);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2015-12-24 18:00:00", 4, 0);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2015-12-31 18:00:00", 4, 4);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-01-07 18:00:00", 4, 5);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-01-14 18:00:00", 4, 6);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-01-21 18:00:00", 4, 7);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-01-28 18:00:00", 4, 8);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-02-04 18:00:00", 4, 9);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-02-11 18:00:00", 4, 0);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-02-18 18:00:00", 4, 10);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-02-25 18:00:00", 4, 11);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-03-03 18:00:00", 4, 12);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-03-10 18:00:00", 4, 13);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-03-17 18:00:00", 4, 14);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-03-24 18:00:00", 4, 15);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-03-31 18:00:00", 4, 16);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-04-07 18:00:00", 4, 17);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-04-14 18:00:00", 4, 18);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-04-21 18:00:00", 4, 19);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-04-28 18:00:00", 4, 20);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-05-05 18:00:00", 4, 21);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-05-12 18:00:00", 4, 22);
INSERT INTO schedules(dt, class_id, course_id) VALUES ("2016-05-19 18:00:00", 4, 23);

CREATE TABLE task_records (
                 student_id INT not null,
                 task_id INT,
                 count MEDIUMINT, 
                 ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                 );
CREATE TABLE schedule_records (
                 student_id INT not null,
                 schedule_id INT,
                 video BOOLEAN, 
                 text BOOLEAN, 
				 exercise BOOLEAN,
                 ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                 );
