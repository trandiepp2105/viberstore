#!/bin/sh

# Tạm thời comment việc kiểm tra Elasticsearch
# echo "Waiting for elasticsearch to be ready..."

# # Kiểm tra trạng thái của elasticsearch, thử lại nếu thất bại
# until curl -s "$ELASTICSEARCH_URL" | grep -q cluster_name; do
#   echo "Elasticsearch is unavailable - waiting..."
#   sleep 5
# done

# echo "Elasticsearch is ready!"

echo "Waiting for MySQL to accept application connections..."

# until mysql \
#   --host="$MYSQL_HOST" \
#   # --port="$MYSQL_PORT" \
#   --user="$MYSQL_USER" \
#   --password="$MYSQL_PASSWORD" \
#   --database="$MYSQL_DATABASE" \
#   --protocol=TCP \
#   --ssl-mode=DISABLED \
#   --execute="SELECT 1;" >/tmp/mysql-check.log 2>&1
# do
#   echo "MySQL at $MYSQL_HOST:$MYSQL_PORT is not ready yet:"
#   cat /tmp/mysql-check.log
#   sleep 5
# done

until mysqladmin ping \
  -h "$MYSQL_HOST" \
  -P "$MYSQL_PORT" \
  -u "$MYSQL_USER" \
  -p"$MYSQL_PASSWORD" \
  --protocol=TCP \
  --skip-ssl \
  --silent
do
  echo "MySQL at $MYSQL_HOST:$MYSQL_PORT is unavailable - waiting..."
  sleep 5
done

echo "MySQL at $MYSQL_HOST:$MYSQL_PORT is ready."



# # Keep the container running
# tail -f /dev/null

echo "Run Django server"
python manage.py makemigrations
# echo "Migrate database"
# python manage.py migrate

echo "Collect static files"
python manage.py collectstatic --noinput
python manage.py create_admin

echo "running server"
python manage.py runserver 0.0.0.0:8000
