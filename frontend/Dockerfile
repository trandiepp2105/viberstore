# Build frontend assets.
FROM node:20 AS build

WORKDIR /frontend

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve static assets with Nginx.
FROM nginx:1.25-alpine

COPY --from=build /frontend/build /usr/share/nginx/html

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
