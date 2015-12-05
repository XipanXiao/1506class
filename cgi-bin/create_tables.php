-- <?php /* This SQL file is named as PHP to avoid accidental web access.

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

-- id = (group_id << 24) | task_id)
CREATE TABLE tasks (
                      id INT NOT NULL PRIMARY KEY,
                      name VARCHAR(32)
                      );
INSERT INTO tasks(id, name) VALUES ((2 << 24) | 1, "观修");
INSERT INTO tasks(id, name) VALUES ((2 << 24) | 2, "观音心咒");
INSERT INTO tasks(id, name) VALUES ((3 << 24) | 1, "顶礼");
INSERT INTO tasks(id, name) VALUES ((3 << 24) | 2, "观修");
INSERT INTO tasks(id, name) VALUES ((3 << 24) | 3, "念诵《开显解脱道》");
INSERT INTO tasks(id, name) VALUES ((3 << 24) | 4, "金刚萨埵心咒");
INSERT INTO tasks(id, name) VALUES ((4 << 24) | 1, "阿弥陀佛圣号");
INSERT INTO tasks(id, name) VALUES ((4 << 24) | 2, "阿弥陀佛圣号（藏文）");

-- id = (group_id << 24) | class_id)
CREATE TABLE classes (
                      id INT NOT NULL PRIMARY KEY,
                      name VARCHAR(32),
                      email VARCHAR(32),
                      class_room VARCHAR(16),
					  teacher_id INT,
					  entrance_date DATETIME,
					  start_date DATETIME,
					  end_date DATETIME
                      );
INSERT INTO classes(id, name, class_room, email, entrance_date, start_date, end_date) VALUES ((2 << 24) | 1, "入行论（周四）", "99343758", "", "2015-06-01 00:00:00", "2015-12-3 18:00:00", "2019-12-3 18:00:00");
INSERT INTO classes(id, name, class_room, email, entrance_date, start_date, end_date) VALUES ((2 << 24) | 2, "入行论（周日）", "99343758", "", "2015-06-01 00:00:00", "2015-12-6 06:30:00", "2019-12-3 18:00:00");
INSERT INTO classes(id, name, class_room, email, entrance_date, start_date, end_date) VALUES ((3 << 24) | 1, "加行（周二）", "99343758", "", "2015-06-01 00:00:00", "2015-12-1 18:00:00", "2019-12-3 18:00:00");
INSERT INTO classes(id, name, class_room, email, entrance_date, start_date, end_date) VALUES ((3 << 24) | 2, "加行（周四）", "99343758", "1506jiaxing@googlegroups.com", "2015-06-01 00:00:00", "2015-12-3 18:00:00", "2019-12-3 18:00:00");
INSERT INTO classes(id, name, class_room, email, entrance_date, start_date, end_date) VALUES ((3 << 24) | 3, "加行（周六）", "99343758", "1506zhangfan@googlegroups.com", "2015-06-01 00:00:00", "2015-12-3 18:00:00", "2019-12-3 18:00:00");
INSERT INTO classes(id, name, class_room, email, entrance_date, start_date, end_date) VALUES ((4 << 24) | 1, "净土（周一）", "99343758", "", "2015-06-01 00:00:00", "2015-11-30 18:30:00", "2019-12-3 18:00:00");

-- id = (group_id << 24) | course_group_id)
CREATE TABLE course_groups(
      id INT NOT NULL PRIMARY KEY,
      name VARCHAR(64),
      url VARCHAR(512)
);
INSERT INTO course_groups(id, name, url) VALUES((2 << 24) | 1, "入行论", "http://www.zhibeifw.com/cmsc/list.php?fid=77");
INSERT INTO course_groups(id, name, url) VALUES((3 << 24) | 1, "前行广释", "http://www.zhibeifw.com/cmsc/list.php?fid=70");
INSERT INTO course_groups(id, name, url) VALUES((4 << 24) | 1, "佛说阿弥陀经释", "");
INSERT INTO course_groups(id, name, url) VALUES((4 << 24) | 2, "普贤行愿品释", "");
INSERT INTO course_groups(id, name, url) VALUES((4 << 24) | 3, "亲友书讲记", "");

CREATE TABLE courses (
                      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                      course_group_id INT,
                      course_name VARCHAR(64),
                      video_url VARCHAR(512),
                      text_url VARCHAR(512)
                      );

-- 1 ~ 23
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行之重要性", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=756&id=770", "http://www.zhibeifw.com/down/videodymqx/qxzzyx.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "《上师瑜伽速赐加持》讲记", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=132&id=725", "http://www.zhibeifw.com/down/doc/201101110003.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第1课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=756&id=957", "http://www.zhibeifw.com/down/videodymqx/dymqxgs001.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第2课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=756&id=2", "http://www.zhibeifw.com/down/videodymqx/dymqxgs002.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第3课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=3", "http://www.zhibeifw.com/down/videodymqx/dymqxgs003.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第4课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=4", "http://www.zhibeifw.com/down/videodymqx/dymqxgs004.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第5课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=5", "http://www.zhibeifw.com/down/videodymqx/dymqxgs005.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第6课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=6", "http://www.zhibeifw.com/down/videodymqx/dymqxgs006.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第7课", "http://www.zhibeifw.com/sskc/sskcmv.php?fid=114&id=7", "http://www.zhibeifw.com/down/videodymqx/dymqxgs007.doc");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第8课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第9课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第10课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第11课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第12课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第13课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第14课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第15课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第16课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第17课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第18课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第19课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第20课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((3 << 24) | 1, "前行广释第21课", "", "");

-- 24 ~ 46
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解1-2课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解3-4课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解5-6课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解7-8课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解9-10课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解11-12课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解13-14课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解15-16课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解17-18课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解19-20课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解21-22课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解23-24课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解25-26课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解27-28课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解29-30课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解31-22课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解33-24课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解35-36课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解37-38课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解39-40课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解41-42课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解43-44课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((2 << 24) | 1, "入行论广解45-46课", "", "");

-- 47 ~ 69
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 1, "佛说阿弥陀经释第1课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 1, "佛说阿弥陀经释第2课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 1, "佛说阿弥陀经释第3课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 1, "佛说阿弥陀经释第4课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 2, "普贤行愿品释第1课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 2, "普贤行愿品释第2课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 2, "普贤行愿品释第3课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 2, "普贤行愿品释第4课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 2, "普贤行愿品释第5课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 2, "普贤行愿品释第6课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 2, "普贤行愿品释第7课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 2, "普贤行愿品释第8课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 2, "普贤行愿品释第9课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 2, "普贤行愿品释第10课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 2, "普贤行愿品释第11课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 2, "普贤行愿品释第12课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 3, "亲友书讲记第1课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 3, "亲友书讲记第2课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 3, "亲友书讲记第3课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 3, "亲友书讲记第4课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 3, "亲友书讲记第5课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 3, "亲友书讲记第6课", "", "");
INSERT INTO courses(course_group_id, course_name, video_url, text_url) VALUES((4 << 24) | 3, "亲友书讲记第7课", "", "");


CREATE TABLE users(
			      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
			      internal_id VARCHAR(8),
			      name VARCHAR(32),
			      password VARCHAR(32),
			      sex BOOLEAN,
			      nickname VARCHAR(32),
			      email VARCHAR(64) NOT NULL,
			      UNIQUE KEY email_idx(email),
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
				      INDEX class_id_idx(class_id),
				      FOREIGN KEY (class_id)
				      	REFERENCES classes(id),
					  course_id INT,
					  open INT,
					  review INT
                      );
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-01 19:00:00", (3 << 24) | 1, 1, 2, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-08 19:00:00", (3 << 24) | 1, 2, 9, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-15 19:00:00", (3 << 24) | 1, 3, 3, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-22 19:00:00", (3 << 24) | 1, 0, 0, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-29 19:00:00", (3 << 24) | 1, 4, 10, 1);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-05 19:00:00", (3 << 24) | 1, 5, 5, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-12 19:00:00", (3 << 24) | 1, 6, 7, 6);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-19 19:00:00", (3 << 24) | 1, 7, 1, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-26 19:00:00", (3 << 24) | 1, 8, 19, 11);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-02 19:00:00", (3 << 24) | 1, 9, 6, 18);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-09 19:00:00", (3 << 24) | 1, 0, 15, 8);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-16 19:00:00", (3 << 24) | 1, 10, 11, 16);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-23 19:00:00", (3 << 24) | 1, 11, 18, 13);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-01 19:00:00", (3 << 24) | 1, 12, 8, 17);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-08 19:00:00", (3 << 24) | 1, 13, 16, 12);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-15 19:00:00", (3 << 24) | 1, 14, 13, 9);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-22 19:00:00", (3 << 24) | 1, 15, 17, 14);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-29 19:00:00", (3 << 24) | 1, 16, 12, 10);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-05 19:00:00", (3 << 24) | 1, 17, 9, 2);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-12 19:00:00", (3 << 24) | 1, 18, 14, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-19 19:00:00", (3 << 24) | 1, 19, 10, 3);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-26 19:00:00", (3 << 24) | 1, 20, 2, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-03 19:00:00", (3 << 24) | 1, 21, 7, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-10 19:00:00", (3 << 24) | 1, 22, 3, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-17 19:00:00", (3 << 24) | 1, 23, 19, 1);

INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-03 18:00:00", (3 << 24) | 2, 1, 2, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-10 18:00:00", (3 << 24) | 2, 2, 9, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-17 18:00:00", (3 << 24) | 2, 3, 3, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-24 18:00:00", (3 << 24) | 2, 0, 0, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-31 18:00:00", (3 << 24) | 2, 4, 10, 1);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-07 18:00:00", (3 << 24) | 2, 5, 5, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-14 18:00:00", (3 << 24) | 2, 6, 7, 6);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-21 18:00:00", (3 << 24) | 2, 7, 1, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-28 18:00:00", (3 << 24) | 2, 8, 19, 11);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-04 18:00:00", (3 << 24) | 2, 9, 6, 18);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-11 18:00:00", (3 << 24) | 2, 0, 15, 8);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-18 18:00:00", (3 << 24) | 2, 10, 11, 16);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-25 18:00:00", (3 << 24) | 2, 11, 18, 13);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-03 18:00:00", (3 << 24) | 2, 12, 8, 17);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-10 18:00:00", (3 << 24) | 2, 13, 16, 12);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-17 18:00:00", (3 << 24) | 2, 14, 13, 9);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-24 18:00:00", (3 << 24) | 2, 15, 17, 14);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-31 18:00:00", (3 << 24) | 2, 16, 12, 10);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-07 18:00:00", (3 << 24) | 2, 17, 9, 2);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-14 18:00:00", (3 << 24) | 2, 18, 14, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-21 18:00:00", (3 << 24) | 2, 19, 10, 3);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-28 18:00:00", (3 << 24) | 2, 20, 2, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-05 18:00:00", (3 << 24) | 2, 21, 7, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-12 18:00:00", (3 << 24) | 2, 22, 3, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-19 18:00:00", (3 << 24) | 2, 23, 19, 1);

INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-05 11:00:00", (3 << 24) | 3, 1, 2, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-12 11:00:00", (3 << 24) | 3, 2, 9, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-19 11:00:00", (3 << 24) | 3, 3, 3, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-26 11:00:00", (3 << 24) | 3, 0, 0, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-02 11:00:00", (3 << 24) | 3, 4, 10, 1);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-09 11:00:00", (3 << 24) | 3, 5, 5, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-16 11:00:00", (3 << 24) | 3, 6, 7, 6);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-23 11:00:00", (3 << 24) | 3, 7, 1, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-30 11:00:00", (3 << 24) | 3, 8, 19, 11);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-06 11:00:00", (3 << 24) | 3, 9, 6, 18);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-13 11:00:00", (3 << 24) | 3, 0, 15, 8);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-20 11:00:00", (3 << 24) | 3, 10, 11, 16);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-27 11:00:00", (3 << 24) | 3, 11, 18, 13);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-05 11:00:00", (3 << 24) | 3, 12, 8, 17);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-12 11:00:00", (3 << 24) | 3, 13, 16, 12);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-19 11:00:00", (3 << 24) | 3, 14, 13, 9);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-26 11:00:00", (3 << 24) | 3, 15, 17, 14);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-02 11:00:00", (3 << 24) | 3, 16, 12, 10);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-09 11:00:00", (3 << 24) | 3, 17, 9, 2);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-16 11:00:00", (3 << 24) | 3, 18, 14, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-23 11:00:00", (3 << 24) | 3, 19, 10, 3);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-30 11:00:00", (3 << 24) | 3, 20, 2, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-07 11:00:00", (3 << 24) | 3, 21, 7, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-14 11:00:00", (3 << 24) | 3, 22, 3, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-21 11:00:00", (3 << 24) | 3, 23, 19, 1);

INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-03 18:00:00", (2 << 24) | 1, 24, 2, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-10 18:00:00", (2 << 24) | 1, 25, 9, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-17 18:00:00", (2 << 24) | 1, 26, 3, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-24 18:00:00", (2 << 24) | 1, 0, 0, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-31 18:00:00", (2 << 24) | 1, 27, 10, 1);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-07 18:00:00", (2 << 24) | 1, 28, 5, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-14 18:00:00", (2 << 24) | 1, 29, 7, 6);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-21 18:00:00", (2 << 24) | 1, 30, 1, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-28 18:00:00", (2 << 24) | 1, 31, 19, 11);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-04 18:00:00", (2 << 24) | 1, 32, 6, 18);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-11 18:00:00", (2 << 24) | 1, 0, 15, 8);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-18 18:00:00", (2 << 24) | 1, 33, 11, 16);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-25 18:00:00", (2 << 24) | 1, 34, 18, 13);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-03 18:00:00", (2 << 24) | 1, 35, 8, 17);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-10 18:00:00", (2 << 24) | 1, 36, 16, 12);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-17 18:00:00", (2 << 24) | 1, 37, 13, 9);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-24 18:00:00", (2 << 24) | 1, 38, 17, 14);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-31 18:00:00", (2 << 24) | 1, 39, 12, 10);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-07 18:00:00", (2 << 24) | 1, 40, 9, 2);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-14 18:00:00", (2 << 24) | 1, 41, 14, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-21 18:00:00", (2 << 24) | 1, 42, 10, 3);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-28 18:00:00", (2 << 24) | 1, 43, 2, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-05 18:00:00", (2 << 24) | 1, 44, 7, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-12 18:00:00", (2 << 24) | 1, 45, 3, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-19 18:00:00", (2 << 24) | 1, 46, 19, 1);

INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-06 06:30:00", (2 << 24) | 2, 24, 2, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-13 06:30:00", (2 << 24) | 2, 25, 9, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-20 06:30:00", (2 << 24) | 2, 26, 3, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-27 06:30:00", (2 << 24) | 2, 0, 0, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-03 06:30:00", (2 << 24) | 2, 27, 10, 1);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-10 06:30:00", (2 << 24) | 2, 28, 5, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-17 06:30:00", (2 << 24) | 2, 29, 7, 6);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-24 06:30:00", (2 << 24) | 2, 30, 1, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-31 06:30:00", (2 << 24) | 2, 31, 19, 11);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-07 06:30:00", (2 << 24) | 2, 32, 6, 18);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-14 06:30:00", (2 << 24) | 2, 0, 15, 8);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-21 06:30:00", (2 << 24) | 2, 33, 11, 16);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-28 06:30:00", (2 << 24) | 2, 34, 18, 13);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-06 06:30:00", (2 << 24) | 2, 35, 8, 17);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-13 06:30:00", (2 << 24) | 2, 36, 16, 12);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-20 06:30:00", (2 << 24) | 2, 37, 13, 9);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-27 06:30:00", (2 << 24) | 2, 38, 17, 14);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-03 06:30:00", (2 << 24) | 2, 39, 12, 10);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-10 06:30:00", (2 << 24) | 2, 40, 9, 2);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-17 06:30:00", (2 << 24) | 2, 41, 14, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-24 06:30:00", (2 << 24) | 2, 42, 10, 3);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-01 06:30:00", (2 << 24) | 2, 43, 2, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-08 06:30:00", (2 << 24) | 2, 44, 7, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-15 06:30:00", (2 << 24) | 2, 45, 3, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-22 06:30:00", (2 << 24) | 2, 46, 19, 1);

INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-11-30 18:30:00", (4 << 24) | 1, 47, 2, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-07 18:30:00", (4 << 24) | 1, 48, 9, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-14 18:30:00", (4 << 24) | 1, 49, 3, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-21 18:30:00", (4 << 24) | 1, 0, 0, 0);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2015-12-28 18:30:00", (4 << 24) | 1, 50, 10, 1);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-04 18:30:00", (4 << 24) | 1, 51, 5, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-11 18:30:00", (4 << 24) | 1, 52, 7, 6);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-18 18:30:00", (4 << 24) | 1, 53, 1, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-01-25 18:30:00", (4 << 24) | 1, 54, 19, 11);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-01 18:30:00", (4 << 24) | 1, 55, 6, 18);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-08 18:30:00", (4 << 24) | 1, 0, 15, 8);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-15 18:30:00", (4 << 24) | 1, 56, 11, 16);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-22 18:30:00", (4 << 24) | 1, 57, 18, 13);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-02-29 18:30:00", (4 << 24) | 1, 58, 8, 17);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-07 18:30:00", (4 << 24) | 1, 59, 16, 12);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-14 18:30:00", (4 << 24) | 1, 60, 13, 9);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-21 18:30:00", (4 << 24) | 1, 61, 17, 14);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-03-28 18:30:00", (4 << 24) | 1, 62, 12, 10);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-04 18:30:00", (4 << 24) | 1, 63, 9, 2);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-11 18:30:00", (4 << 24) | 1, 64, 14, 7);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-18 18:30:00", (4 << 24) | 1, 65, 10, 3);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-04-25 18:30:00", (4 << 24) | 1, 66, 2, 19);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-02 18:30:00", (4 << 24) | 1, 67, 7, 5);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-09 18:30:00", (4 << 24) | 1, 68, 3, 15);
INSERT INTO schedules(dt, class_id, course_id, open, review) VALUES ("2016-05-16 18:30:00", (4 << 24) | 1, 69, 19, 1);


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
                 ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                 );

-- */ ?>
