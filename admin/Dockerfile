# Stage 1: Build React App
FROM node:20 AS build

# Đặt thư mục làm việc trong container cho giai đoạn build
WORKDIR /admin

# Sao chép package.json và package-lock.json (hoặc yarn.lock)
# Tận dụng Docker layer caching
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn ứng dụng vào container
COPY . .

# Build ứng dụng React cho môi trường production
RUN npm run build

# Stage 2: Serve with Nginx (HTTP only)
FROM nginx:1.25-alpine 

# Sao chép build output từ stage 'build' vào thư mục web root của Nginx
COPY --from=build /admin/build /usr/share/nginx/html

# Sao chép file cấu hình Nginx tùy chỉnh cho HTTP
# File này sẽ định nghĩa Nginx lắng nghe trên port 80
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Nginx sẽ lắng nghe trên port này theo default.conf)
EXPOSE 80

# Lệnh mặc định để chạy Nginx khi container khởi động
CMD ["nginx", "-g", "daemon off;"]