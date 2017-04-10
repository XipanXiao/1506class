mysqldump -u $OPENSHIFT_MYSQL_DB_USERNAME -h $OPENSHIFT_MYSQL_DB_HOST -p$OPENSHIFT_MYSQL_DB_PASSWORD buddcourses --default-character-set=utf8 --result-file=$1
mysql -u $OPENSHIFT_MYSQL_DB_USERNAME -h $OPENSHIFT_MYSQL_DB_HOST -p$OPENSHIFT_MYSQL_DB_PASSWORD buddcourses < data/create_tables.sql
