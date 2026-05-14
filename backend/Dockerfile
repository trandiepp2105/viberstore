FROM python:3.11-slim

# Set work directory
WORKDIR /backend
ENV PYTHONPATH=/backend

# Cài các gói cần thiết cho Pillow, mysqlclient và xử lý ảnh
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    libavif-dev \
    libwebp-dev \
    libpng-dev \
    ffmpeg \
    curl \
    default-mysql-client \
    default-libmysqlclient-dev \
    pkg-config \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy và cài Python requirements
COPY requirements.txt ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ project vào container
COPY . .

# Copy và thiết lập entrypoint script
COPY ./entrypoint.sh /backend/entrypoint.sh
RUN chmod +x /backend/entrypoint.sh && \
    sed -i 's/\r$//' /backend/entrypoint.sh

ENTRYPOINT ["/backend/entrypoint.sh"]
