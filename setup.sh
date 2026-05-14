#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.yml"
ENV_FILE="${PROJECT_DIR}/.env"
MYSQL_INIT_FLAG_SCRIPT="${PROJECT_DIR}/initial_data/99_create_import_done_flag.sh"

INSTALL_DOCKER=false
OPEN_FIREWALL=false
BUILD_IMAGES=true

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

warn() {
  printf '\n[WARN] %s\n' "$1"
}

die() {
  printf '\n[ERROR] %s\n' "$1" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Usage: ./setup.sh [options]

Options:
  --install-docker   Cai Docker Engine + Docker Compose plugin neu may chua co
  --open-firewall    Mo UFW cho 22, 80, 443
  --no-build         Khong build lai image khi up compose
  -h, --help         Hien thi huong dan

Script se:
  1. Kiem tra file .env va docker-compose.yml
  2. Chuan hoa quyen cho script init MySQL
  3. Tao cac thu muc host bind mount can thiet
  4. Validate docker compose config
  5. Build va start stack
EOF
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --install-docker)
        INSTALL_DOCKER=true
        ;;
      --open-firewall)
        OPEN_FIREWALL=true
        ;;
      --no-build)
        BUILD_IMAGES=false
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        die "Unknown option: $1"
        ;;
    esac
    shift
  done
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

install_docker_if_needed() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    log "Docker va Docker Compose da san sang"
    return
  fi

  [[ "${INSTALL_DOCKER}" == "true" ]] || die "Docker/Compose chua co. Chay lai voi --install-docker"

  log "Cai dat Docker Engine va Docker Compose plugin"
  require_command curl
  require_command sudo

  sudo apt-get update -y
  sudo apt-get install -y ca-certificates curl gnupg

  sudo install -m 0755 -d /etc/apt/keyrings
  if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
  fi

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  sudo usermod -aG docker "${USER}" || true
  warn "Da them ${USER} vao group docker. Co the can dang nhap lai neu shell hien tai chua nhan group moi."
}

check_project_files() {
  log "Kiem tra cac file can thiet"
  [[ -f "${COMPOSE_FILE}" ]] || die "Khong tim thay ${COMPOSE_FILE}"
  [[ -f "${ENV_FILE}" ]] || die "Khong tim thay ${ENV_FILE}"
  [[ -f "${MYSQL_INIT_FLAG_SCRIPT}" ]] || die "Khong tim thay ${MYSQL_INIT_FLAG_SCRIPT}"
}

prepare_project_dirs() {
  log "Chuan hoa thu muc va quyen can thiet cho deploy"
  chmod +x "${MYSQL_INIT_FLAG_SCRIPT}"

  mkdir -p \
    "${PROJECT_DIR}/backend/static" \
    "${PROJECT_DIR}/backend/media"
}

open_firewall_if_requested() {
  [[ "${OPEN_FIREWALL}" == "true" ]] || return

  log "Cau hinh UFW cho deploy"
  require_command sudo

  if ! command -v ufw >/dev/null 2>&1; then
    sudo apt-get update -y
    sudo apt-get install -y ufw
  fi

  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw --force enable
  sudo ufw status verbose
}

validate_compose() {
  log "Validate docker compose config"
  docker compose -f "${COMPOSE_FILE}" config >/dev/null
}

deploy_stack() {
  log "Khoi dong ViberStore stack"

  if [[ "${BUILD_IMAGES}" == "true" ]]; then
    docker compose -f "${COMPOSE_FILE}" up -d --build
  else
    docker compose -f "${COMPOSE_FILE}" up -d
  fi
}

show_summary() {
  log "Trang thai container"
  docker compose -f "${COMPOSE_FILE}" ps

  cat <<EOF

Deploy hoan tat.

Truy cap:
  - Frontend: http://<APP_HOST>/
  - Admin:    http://<APP_HOST>/dashboard/
  - API:      http://<APP_HOST>/api/v1/
  - Django:   http://<APP_HOST>/admin/

Neu vua doi file .env:
  docker compose up -d --force-recreate

Neu vua doi code React:
  docker compose up -d --build viberstore_frontend viberstore_admin

Neu can xem log:
  docker compose logs -f viberstore_nginx
  docker compose logs -f viberstore_backend
  docker compose logs -f viberstore_mysql
EOF
}

main() {
  parse_args "$@"
  install_docker_if_needed
  require_command docker
  check_project_files
  prepare_project_dirs
  open_firewall_if_requested
  validate_compose
  deploy_stack
  show_summary
}

main "$@"
