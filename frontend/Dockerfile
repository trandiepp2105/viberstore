# Stage 1: Build React App
FROM node:20 AS build

WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build files from the React app
COPY --from=build /frontend/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 443 for HTTPS
EXPOSE 443

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
