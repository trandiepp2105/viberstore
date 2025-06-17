# Fashion E-commerce Platform (Django & React)

A full-stack fashion e-commerce website built with a Django backend and ReactJS for the frontend and admin panel. The application allows users to browse products, manage their cart, place orders with online payment, and manage their account. It features OTP verification for secure registration, uses Elasticsearch for enhanced search capabilities, and is deployed using Docker on Microsoft Azure.

**Live Application URL:** [http://4.241.129.97:8081](http://4.241.129.97:8081)
_(Please note: This is a public IP address. The frontend might be accessible on port 80 and the admin panel on port 8082 as per backend configuration: `http://4.241.129.97:8081` for frontend, `http://4.241.129.97:8082` for admin. DNS is not yet configured for a custom domain.)_

## ✨ Features

**User Management:**

- **User Registration:** New users can create an account.
- **OTP Email Verification:** Ensures users register with a valid, owned email address.
- **User Login/Logout:** Secure authentication for registered users.
- **Account Management:** Users can view their order history.

**Product & Catalog:**

- **Product Listing:** View available fashion products.
- **Product Search:** Find specific products using a search functionality (powered by Elasticsearch).
- **Product Details:** View detailed information for each product.

**Shopping Cart & Checkout:**

- **Add to Cart:** Users can add products to their shopping cart.
- **Update Cart Quantity:** Modify the number of items for a product in the cart.
- **Apply Discount Vouchers:** Users can apply available discount codes to their order.
- **Order Placement:** Complete the checkout process to place an order.
- **Online Payment:** Integrated with VNPay for secure online transactions.

**Order Management (User-side):**

- **View Order History:** Users can see a list of their past and current orders.
- **Cancel Order:** Users can cancel orders (presumably before processing).
- **Confirm Order Received:** Users can mark an order as received.
- **Delete Cancelled Orders:** Users can remove cancelled orders from their history.

**Admin Panel (ReactJS):**

- (Implicit) Management of products, categories, orders, users, discount vouchers, etc.

## 🛠️ Tech Stack

- **Backend:**
  - Framework: Django (Python)
  - API: Django REST Framework
- **Frontend & Admin Panel:**
  - Library: ReactJS
  - State Management: (e.g., Redux, Context API - _specify if known_)
- **Database:** MySQL
- **Search Engine:** Elasticsearch
- **Caching & Celery Broker:** Redis
- **Payment Gateway:** VNPay
- **Containerization:** Docker, Docker Compose
- **Deployment:** Microsoft Azure

## 🚀 Getting Started (Local Development)

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Git
- Docker & Docker Compose
- Node.js & npm/yarn (if you intend to run frontend/admin outside Docker for development or manage dependencies)
- Python & pip (if you intend to run backend outside Docker for development)

### Installation with Docker

This is the recommended way to run the entire stack locally.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/trandiepp2105/viberstore.git
    cd viberstore
    ```

2.  **Configure Environment Variables:**
    You will need to create `.env` files for the backend, frontend, and admin panel.
    **Do not commit your actual `.env` files with sensitive credentials.**

    - **Backend (`.env`):**
      Create this file at the same level as the docker-compose.yml file.
      For local development, it should look something like this (adjust paths and service names according to your `docker-compose.yml`):

      ```env
      DJANGO_SECRET_KEY=your_strong_local_secret_key # Change this!
      DJANGO_DEBUG=True

      # =======================================
      # URLS & ALLOWED HOSTS (Local Development)
      # =======================================
      # For local Docker, these might not be strictly needed if services communicate via Docker network
      # Or can be set to localhost for services exposed to the host machine
      APP_ORIGIN=http://localhost:8000
      FRONTEND_ORIGIN=http://localhost:3000 # Adjust port if your local frontend runs elsewhere
      ADMIN_ORIGIN=http://localhost:3001   # Adjust port if your local admin runs elsewhere
      FRONTEND_ACCESS_URL=http://localhost:3000/ # For VNPay return, etc.
      ADMIN_ACCESS_URL=http://localhost:3001/
      DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend,viberstore_backend # 'backend' or 'viberstore_backend' if that's the service name

      # =======================================
      # MYSQL CONFIGURATION
      # =======================================
      MYSQL_HOST=viberstore_mysql # Docker service name for MySQL
      MYSQL_PORT=3309             # MySQL port INSIDE its container
      MYSQL_ROOT_PASSWORD=your_mysql_root_password_local
      MYSQL_USER=trandiep
      MYSQL_PASSWORD=your_local_db_password # Change for local dev, DO NOT use production password
      MYSQL_DATABASE=viberstore

      # =======================================
      # REDIS CONFIGURATION
      # =======================================
      REDIS_HOST=viberstore_redis # Docker service name for Redis
      REDIS_CACHE_URL=redis://${REDIS_HOST}:6379/1

      # =======================================
      # CELERY CONFIGURATION
      # =======================================
      CELERY_BROKER_URL=redis://${REDIS_HOST}:6379/0
      CELERY_RESULT_BACKEND=redis://${REDIS_HOST}:6379/0

      # =======================================
      # EMAIL CONFIGURATION (Use a local mail catcher like MailHog for dev, or your test Gmail)
      # =======================================
      EMAIL_HOST=smtp.gmail.com # Or your local mail server (e.g., mailhog)
      EMAIL_PORT=587            # Or 1025 for MailHog
      EMAIL_USE_TLS=True
      EMAIL_HOST_USER=your_test_email@gmail.com
      EMAIL_HOST_PASSWORD=your_app_password_or_test_password # For Gmail, use an App Password

      # =======================================
      # VNPAY CONFIGURATION
      # =======================================
      VNPAY_RETURN_URL=${FRONTEND_ACCESS_URL}payment # e.g., http://localhost:3000/payment
      VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
      VNPAY_API_URL=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
      VNPAY_TMN_CODE=GO9RGB4P # Your test TMN code
      VNPAY_HASH_SECRET_KEY=3M54IMQIY2B94VJGSTJGLGBDXNSPJIOE # Your test hash secret

      # =======================================
      # ELASTICSEARCH CONFIGURATION
      # =======================================
      ELASTICSEARCH_URL=http://elasticsearch:9200 # Docker service name for Elasticsearch
      ELASTIC_USERNAME=elastic # Default or as configured
      ELASTIC_PASSWORD=your_elastic_password_local # Change this

      # =======================================
      # JWT TOKEN LIFETIMES
      # =======================================
      ACCESS_TOKEN_LIFETIME_HOURS=5
      REFRESH_TOKEN_LIFETIME_DAYS=1

      # =======================================
      # ADMIN USER CREDENTIALS (For initial setup script if any, otherwise created via createsuperuser)
      # =======================================
      ADMIN_EMAIL="admin_local@example.com"
      ADMIN_PASSWORD="adminlocalpassword"
      ```

    - **Frontend (`frontend/.env`):**
      Create this file in your `frontend` directory. Copy from `frontend/.env.example` if available.

      ```env
      REACT_APP_API_URL=http://localhost:8000/api # URL of your Django backend API for local development
      # For production, this might be REACT_APP_API_URL=http://20.198.225.85/api (or via Nginx)

      # Example based on your provided production values, adjust for local if needed:
      # REACT_APP_SERVER_HOST=localhost
      # REACT_APP_SERVER_PORT=8000
      ```

    - **Admin Panel (`admin/.env` or `frontend/.env` if part of the same React app):**
      Create this file in your `admin` panel's source directory. Copy from `admin/.env.example` if available.
      (If your admin panel is part of the same React project as the frontend, these might go into `frontend/.env` with appropriate prefixes or logic to differentiate).

      ```env
      REACT_APP_API_URL=http://localhost:8000/api # URL of your Django backend API for local development
      REACT_APP_ADMIN_BASENAME=/admin # Base path for the admin panel routes

      # Example based on your provided production values, adjust for local if needed:
      # REACT_APP_SERVER_HOST=localhost
      # REACT_APP_SERVER_PORT=8000
      ```

      **Note:** `REACT_APP_SERVER_HOST` and `REACT_APP_SERVER_PORT` in your provided frontend/admin envs seem to point to the backend. The `REACT_APP_API_URL` is usually the primary way React apps connect to the backend.

3.  **Build and Run with Docker Compose:**
    From the root directory of the project (where `docker-compose.yml` is located):

    ```bash
    docker-compose up --build -d
    ```

    - `--build`: Forces a rebuild of the images if they've changed.
    - `-d`: Runs containers in detached mode.

4.  **Apply Backend Migrations (if not handled by an entrypoint script in your Docker setup):**

    ```bash
    docker-compose exec <backend_service_name> python manage.py makemigrations
    docker-compose exec <backend_service_name> python manage.py migrate
    ```

    (Replace `<backend_service_name>` with the name of your Django service in `docker-compose.yml`, e.g., `backend` or `viberstore_backend`).

    You might also need to create a superuser:

    ```bash
    docker-compose exec <backend_service_name> python manage.py createsuperuser
    ```

5.  **Access the application:**
    The ports depend on your `docker-compose.yml` configuration for port mapping. Common defaults:
    - **Frontend:** `http://localhost:3000` (or the port you've mapped, e.g., `8081`)
    - **Admin Panel:** `http://localhost:3001` (or the port you've mapped, e.g., `8082`, often at a path like `http://localhost:3001/admin`)
    - **Backend API:** `http://localhost:8000` (or the port you've mapped)

## 🧪 Testing VNPay Integration

To test the VNPay payment gateway integration using the sandbox environment:

- **Ensure your `VNPAY_RETURN_URL` in the backend's `.env` file is correctly configured** to point to your frontend's payment confirmation page during local development (e.g., `http://localhost:3000/payment` or `http://localhost:8081/payment`).
- **Use the following test card details provided for NCB bank:**
  - **Ngân hàng (Bank):** NCB
  - **Số thẻ (Card Number):** `9704198526191432198`
  - **Tên chủ thẻ (Cardholder Name):** `NGUYEN VAN A`
  - **Ngày phát hành (Issue Date):** `07/15` (Enter as MM/YY. This is typically the card's "valid from" or issue month/year for test purposes).
  - **Mật khẩu OTP (OTP Password):** `123456`

## ☁️ Deployment

The application is containerized using Docker and is currently deployed on **Microsoft Azure**. The live instance is accessible via its public IP.

- **Main Access/Frontend:** `http://20.198.225.85` (Potentially `http://20.198.225.85:8081`)
- **Admin Panel:** `http://20.198.225.85:8082` (or `http://20.198.225.85/admin` if routed via a reverse proxy)

Future improvements may include setting up a DNS record for a custom domain name and configuring a reverse proxy (like Nginx) to handle SSL and route traffic to the appropriate ports/services without exposing them directly.

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📜 License

Distributed under the MIT License. See `LICENSE` file for more information.
_(Create a `LICENSE` file in your root directory with the MIT license text if you don't have one.)_

---

**Author:** Van Diep Tran
**GitHub:** https://github.com/trandiepp2105
