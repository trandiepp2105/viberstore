#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

docker compose --env-file .env -f deploy/docker-compose.prod.yml \
  run --rm certbot renew --webroot --webroot-path /var/www/certbot

# Reload Nginx so it starts using the renewed certificate files.
docker compose --env-file .env \
  -f deploy/docker-compose.prod.yml \
  -f deploy/docker-compose.prod.https.yml \
  exec -T nginx nginx -s reload
