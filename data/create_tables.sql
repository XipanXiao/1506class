CREATE TABLE IF NOT EXISTS item_categories(
        id MEDIUMINT PRIMARY KEY AUTO_INCREMENT,
        parent_id MEDIUMINT,
        name VARCHAR(64) COLLATE utf8_unicode_ci NOT NULL
        );
INSERT INTO item_categories (id, name) VALUES(1, "法本");

CREATE TABLE IF NOT EXISTS items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category MEDIUMINT,
          FOREIGN KEY (category) REFERENCES item_categories(id),
        price DECIMAL NOT NULL,
        name VARCHAR(64) COLLATE utf8_unicode_ci NOT NULL,
        image VARCHAR(256) COLLATE utf8_unicode_ci,
        producer VARCHAR(64) COLLATE utf8_unicode_ci,
        description VARCHAR(64) COLLATE utf8_unicode_ci
        );
INSERT INTO items (id, category, price, name, image, producer) VALUES
(1, 1, 23.0, "预科系入行论教材(全10册)", "images/ruxinglun.jpg", "索达吉堪布"),
(2, 1, 23.0, "预科系加行教材(全7册)", "images/jiaxing.jpg", "索达吉堪布"),
(3, 1, 23.0, "预科系净土教材(全7册)", "images/jingtu.jpg", "索达吉堪布");

CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        status TINYINT NOT NULL DEFAULT 0,
        sub_total DECIMAL NOT NULL DEFAULT 0,
        paid DECIMAL,
        shipping DECIMAL,
        `phone` varchar(16) COLLATE utf8_unicode_ci DEFAULT NULL,
        `street` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
        `city` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
        `state` tinyint(4) DEFAULT NULL,
        `country` char(2) COLLATE utf8_unicode_ci DEFAULT NULL,
        `zip` char(6) COLLATE utf8_unicode_ci DEFAULT NULL,
        shipping_date DATE,
        deliver_date DATE,
        created_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
  
CREATE TABLE IF NOT EXISTS closed_orders SELECT * FROM orders LIMIT 0;

CREATE TABLE IF NOT EXISTS order_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        item_id INT,
        FOREIGN KEY (item_id) REFERENCES items(id),
        price DECIMAL NOT NULL,
        count MEDIUMINT NOT NULL DEFAULT 1
      );

CREATE TABLE IF NOT EXISTS closed_order_details 
    SELECT * FROM order_details LIMIT 0;
