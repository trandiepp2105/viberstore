#!/bin/sh

echo "Waiting for elasticsearch to be ready..."

# Kiểm tra trạng thái của elasticsearch, thử lại nếu thất bại
until curl -s -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" "$ELASTICSEARCH_URL" | grep -q cluster_name; do
  echo "Elasticsearch is unavailable - waiting..."
  sleep 5
done

echo "Elasticsearch is ready!"

echo "Waiting for MySQL to be ready..."

# Kiểm tra trạng thái của MySQL, thử lại nếu thất bại
until mysqladmin ping -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" --silent; do
  echo "MySQL at $MYSQL_HOST:$MYSQL_PORT is unavailable - waiting..."
  sleep 5
done

# Sửa: Thêm $MYSQL_PORT vào thông báo thành công
echo "MySQL at $MYSQL_HOST:$MYSQL_PORT is ready."


# Keep the container running
tail -f /dev/null

# echo "Run Django server"
# python manage.py makemigrations
# python manage.py migrate
# python manage.py create_admin
# python manage.py runserver 0.0.0.0:8000
