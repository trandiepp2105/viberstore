#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
CERT_DIR="$ROOT_DIR/deploy/certs/dev"
MKCERT_BIN=$(command -v mkcert || true)

if [ -z "$MKCERT_BIN" ] && [ -x "$HOME/.local/bin/mkcert" ]; then
  PATH="$HOME/.local/bin:$PATH"
  export PATH
  MKCERT_BIN="$HOME/.local/bin/mkcert"
fi

if [ -z "$MKCERT_BIN" ]; then
  echo "mkcert is required. Install it first: https://github.com/FiloSottile/mkcert#installation" >&2
  exit 1
fi

# This workspace runs on Linux and is opened in Chrome; use the browser trust
# store by default so local CA installation does not require root privileges.
TRUST_STORES=${TRUST_STORES:-nss}
export TRUST_STORES

mkdir -p "$CERT_DIR"
"$MKCERT_BIN" -install
"$MKCERT_BIN" \
  -cert-file "$CERT_DIR/localhost.pem" \
  -key-file "$CERT_DIR/localhost-key.pem" \
  localhost 127.0.0.1 ::1

echo "Development certificate created in deploy/certs/dev (ignored by Git)."
