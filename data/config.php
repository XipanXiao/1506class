{ "nothing" : "<?php /* This makes the following content invisible for web access",
  "localhost": {
    "servername": "127.0.0.1",
    "username": "root",
    "password": "1234567890",
    "dbname": "buddcourses",
    "zbServiceUrl": "http://db.zhibeifw.com:8888/zb"
  },
  "buddcourses-bicw.rhcloud.com": {
    "servername": "${OPENSHIFT_MYSQL_DB_HOST}",
    "username": "${OPENSHIFT_MYSQL_DB_USERNAME}",
    "password": "${OPENSHIFT_MYSQL_DB_PASSWORD}",
    "dbname": "buddcourses",
    "session_path": "${OPENSHIFT_TMP_DIR}",
    "zbServiceUrl": "http://db.zhibeifw.com:8888/zb"
  },
  "buddcourses-bicwdev.rhcloud.com": {
    "servername": "${OPENSHIFT_MYSQL_DB_HOST}",
    "username": "${OPENSHIFT_MYSQL_DB_USERNAME}",
    "password": "${OPENSHIFT_MYSQL_DB_PASSWORD}",
    "dbname": "buddcourses",
    "session_path": "${OPENSHIFT_TMP_DIR}",
    "zbServiceUrl": ""
  },
  "closing": "*/?>"
}
