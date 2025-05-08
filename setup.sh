#!/bin/bash


PROJECT_DIR="/viberstore" # <<<--- !!! CHỈNH SỬA ĐƯỜNG DẪN NÀY !!!

# ================================

# Dừng script ngay nếu có lỗi
set -e

echo "=================================================="
echo "Bắt đầu quá trình chuẩn bị VM cho ViberStore..."
echo "=================================================="

# ---- Task 1: Cập nhật hệ thống ----
echo "[TASK 1] Cập nhật danh sách gói và nâng cấp hệ thống..."
sudo apt-get update -y
# sudo apt-get upgrade -y # Bỏ comment nếu muốn nâng cấp tất cả gói (có thể mất thời gian)
echo "[TASK 1] Hoàn thành."
echo "--------------------------------------------------"

# ---- Task 2: Cài đặt Docker và Docker Compose plugin ----
echo "[TASK 2] Cài đặt Docker và Docker Compose..."

# Cài đặt các gói cần thiết
echo "  - Cài đặt các gói phụ thuộc..."
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common \
    gnupg \
    lsb-release
echo "  - Đã cài đặt các gói phụ thuộc."

# Thêm GPG key chính thức của Docker
echo "  - Thêm Docker GPG key..."
sudo rm -f /etc/apt/keyrings/docker.gpg # Xóa key cũ nếu có
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "  - Đã thêm Docker GPG key."

# Thêm Docker repository
echo "  - Thêm Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
echo "  - Đã thêm Docker repository."

# Cập nhật lại danh sách gói
echo "  - Cập nhật lại danh sách gói..."
sudo apt-get update -y
echo "  - Đã cập nhật."

# Cài đặt Docker Engine và Compose plugin
echo "  - Cài đặt Docker Engine và Docker Compose plugin..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
echo "  - Đã cài đặt Docker."

# Thêm user hiện tại vào group docker
echo "  - Thêm user '${USER}' vào group 'docker'..."
sudo usermod -aG docker ${USER}
echo "  - Đã thêm user vào group. Cần logout/login lại hoặc chạy 'newgrp docker' để áp dụng."

echo "[TASK 2] Hoàn thành."
echo "--------------------------------------------------"

# ---- Task 3: Cấp quyền thực thi cho script init MySQL ----
echo "[TASK 3] Cấp quyền thực thi cho script MySQL init flag..."

# Kiểm tra xem thư mục dự án đã được cấu hình chưa
if [ "${PROJECT_DIR}" = "/path/to/your/viberstore_project" ]; then
  echo "  * CẢNH BÁO: Biến PROJECT_DIR chưa được chỉnh sửa trong script này."
  echo "  * Bỏ qua việc cấp quyền cho script init MySQL."
  echo "  * Hãy chạy lệnh sau thủ công sau khi dự án đã có trên VM:"
  echo "  * sudo chmod +x ${PROJECT_DIR}/initial_data/99_create_import_done_flag.sh"
elif [ -f "${PROJECT_DIR}/initial_data/99_create_import_done_flag.sh" ]; then
  sudo chmod +x "${PROJECT_DIR}/initial_data/99_create_import_done_flag.sh"
  echo "  - Đã cấp quyền thực thi cho ${PROJECT_DIR}/initial_data/99_create_import_done_flag.sh"
else
  echo "  * CẢNH BÁO: Không tìm thấy file ${PROJECT_DIR}/initial_data/99_create_import_done_flag.sh."
  echo "  * Đảm bảo biến PROJECT_DIR đúng và dự án đã được đặt ở đó."
  echo "  * Bạn có thể cần chạy lại lệnh chmod thủ công."
fi

echo "[TASK 3] Hoàn thành."
echo "--------------------------------------------------"

# ---- Task 4: Cấu hình Firewall (UFW) ----
echo "[TASK 4] Cấu hình Firewall (UFW) để mở các cổng cần thiết..."

# Cài đặt UFW nếu chưa có (thường có sẵn trên Ubuntu)
if ! command -v ufw &> /dev/null
then
    echo "  - UFW không được tìm thấy. Đang cài đặt..."
    sudo apt-get install -y ufw
    echo "  - Đã cài đặt UFW."
fi

# Mở các cổng được yêu cầu
echo "  - Mở cổng 22 (SSH - Rất quan trọng!)"
sudo ufw allow 22/tcp

echo "  - Mở cổng 80 (HTTP - Cho Nginx trên VM)"
sudo ufw allow 80/tcp

echo "  - Mở cổng 443 (HTTPS - Cho Nginx trên VM sau này)"
sudo ufw allow 443/tcp

echo "  - Mở cổng 8081 (Docker map - Frontend Container)"
sudo ufw allow 8081/tcp

echo "  - Mở cổng 8082 (Docker map - Admin Container)"
sudo ufw allow 8082/tcp

echo "  - Mở cổng 8000 (Docker map - Backend Container)"
sudo ufw allow 8000/tcp

echo "  - Mở cổng 9200 (Docker map - Elasticsearch)"
sudo ufw allow 9200/tcp

echo "  - Mở cổng 3309 (Docker map - MySQL Container)"
sudo ufw allow 3309/tcp

echo "  - Mở cổng 6379 (Docker map - Redis Container)"
sudo ufw allow 6379/tcp

# Kích hoạt UFW (sẽ yêu cầu xác nhận nếu chạy thủ công)
echo "  - Kích hoạt UFW (Tường lửa)..."
# Thêm "y" để tự động xác nhận
echo "y" | sudo ufw enable
echo "  - UFW đã được kích hoạt."

# Hiển thị trạng thái UFW
echo "  - Trạng thái UFW hiện tại:"
sudo ufw status verbose

echo "[TASK 4] Hoàn thành."
echo "*** CẢNH BÁO BẢO MẬT ***"
echo "* Việc mở các cổng 8081, 8082, 8000, 9200, 3309, 6379 trực tiếp ra internet có thể không an toàn."
echo "* Trong môi trường production, bạn thường chỉ cần mở cổng 80, 443 (cho Nginx VM) và 22 (SSH, nên giới hạn IP nguồn)."
echo "* Nginx trên VM sẽ là điểm truy cập duy nhất và proxy đến các container bên trong."
echo "* Hãy xem xét lại các quy tắc tường lửa này dựa trên nhu cầu bảo mật của bạn."
echo "--------------------------------------------------"


echo "=================================================="
echo "Quá trình chuẩn bị VM hoàn tất!"
echo "Hãy logout và login lại để sử dụng docker không cần sudo."
echo "Đảm bảo bạn đã chỉnh sửa biến PROJECT_DIR nếu cần và dự án đã có trên VM."
echo "=================================================="