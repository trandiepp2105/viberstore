# Build admin assets.
FROM node:20 AS build

WORKDIR /admin

ARG PUBLIC_URL=/dashboard
ENV PUBLIC_URL=${PUBLIC_URL}

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve static assets with Nginx.
FROM nginx:1.25-alpine

COPY --from=build /admin/build /usr/share/nginx/html

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
