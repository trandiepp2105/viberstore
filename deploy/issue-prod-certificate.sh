#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

# Keep the HTTP stack running while Let's Encrypt validates its HTTP-01 challenge.
docker compose --env-file .env -f deploy/docker-compose.prod.yml up -d
docker compose --env-file .env -f deploy/docker-compose.prod.yml run --rm certbot

# Once the certificate exists, enable the HTTPS overlay and force HTTP to redirect.
docker compose --env-file .env \
  -f deploy/docker-compose.prod.yml \
  -f deploy/docker-compose.prod.https.yml \
  up -d

echo "HTTPS is enabled. Set up deploy/renew-prod-certificate.sh to run daily."
