# Fashion E-commerce Platform (Django & React)

A full-stack fashion e-commerce website built with a Django backend and ReactJS for the frontend and admin panel. The application allows users to browse products, manage their cart, place orders with online payment, and manage their account. It features OTP verification for secure registration and is deployed using Docker on Microsoft Azure.

**Live Application URL:** [http://20.198.225.85](http://20.198.225.85)
_(Please note: This is a public IP address as DNS is not yet configured for a custom domain.)_

## ✨ Features

**User Management:**

- **User Registration:** New users can create an account.
- **OTP Email Verification:** Ensures users register with a valid, owned email address.
- **User Login/Logout:** Secure authentication for registered users.
- **Account Management:** Users can view their order history.

**Product & Catalog:**

- **Product Listing:** View available fashion products.
- **Product Search:** Find specific products using a search functionality.
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

- (Implicit) Management of products, categories, orders, users, and discount vouchers.

## 🛠️ Tech Stack

- **Backend:**
  - Framework: Django (Python)
  - API: Django REST Framework
- **Frontend & Admin Panel:**
  - Library: ReactJS
  - State Management: (e.g., Redux, Context API - _you can specify if known_)
- **Database:** MySQL
- **Caching:** Redis
- **Payment Gateway:** VNPay
- **Containerization:** Docker, Docker Compose
- **Deployment:** Microsoft Azure

## 🚀 Getting Started (Local Development)

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Git
- Docker & Docker Compose
- Node.js & npm/yarn (if you want to run frontend outside Docker for development)
- Python & pip (if you want to run backend outside Docker for development)

### Installation with Docker

This is the recommended way to run the entire stack locally.

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.S **Configure Environment Variables:**
You will likely need `.env` files for both the backend and frontend. Create them based on provided `.env.example` files (if they exist in your repo).

    *   **Backend (`backend/.env`):**
        ```env
        DEBUG=True
        SECRET_KEY=your_strong_secret_key_here
        DATABASE_ENGINE=django.db.backends.mysql
        DATABASE_NAME=your_db_name
        DATABASE_USER=your_db_user
        DATABASE_PASSWORD=your_db_password
        DATABASE_HOST=db # This should match the service name in docker-compose.yml
        DATABASE_PORT=3306
        REDIS_HOST=redis # This should match the service name in docker-compose.yml
        REDIS_PORT=6379
        VNPAY_TMN_CODE=YOUR_VNPAY_TMN_CODE
        VNPAY_HASH_SECRET_KEY=YOUR_VNPAY_HASH_SECRET_KEY
        VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html # VNPay Sandbox URL
        VNPAY_RETURN_URL=http://localhost:3000/payment-return # Or your frontend return URL
        # ... other backend specific variables
        ```

    *   **Frontend (`frontend/.env`):**
        ```env
        REACT_APP_API_URL=http://localhost:8000/api # Or your backend API URL
        # ... other frontend specific variables
        ```

3.  **Build and Run with Docker Compose:**
    From the root directory of the project (where `docker-compose.yml` is located):

    ```bash
    docker-compose up --build -d
    ```

    - `--build`: Forces a rebuild of the images if they've changed.
    - `-d`: Runs containers in detached mode.

4.  **Apply Backend Migrations (if not handled by an entrypoint script):**

    ```bash
    docker-compose exec backend python manage.py makemigrations
    docker-compose exec backend python manage.py migrate
    ```

    You might also need to create a superuser:

    ```bash
    docker-compose exec backend python manage.py createsuperuser
    ```

5.  **Access the application:**
    - Frontend: `http://localhost:3000` (or the port mapped for your React app)
    - Backend API: `http://localhost:8000` (or the port mapped for Django)

## 🧪 Testing VNPay Integration

To test the VNPay payment gateway integration, you can use the following test card details provided:

- **Ngân hàng (Bank):** NCB
- **Số thẻ (Card Number):** `9704198526191432198`
- **Tên chủ thẻ (Cardholder Name):** `NGUYEN VAN A`
- **Ngày phát hành (Issue Date):** `07/15` (Enter as MM/YY if required, or follow the format specified by the VNPay test form. This typically refers to the card issue month/year for test cards, not a strict expiry for validation logic in sandbox).
- **Mật khẩu OTP (OTP Password):** `123456`

**Note:** Ensure your `VNPAY_RETURN_URL` in the backend `.env` file is correctly configured to point to your frontend's payment confirmation page, especially during local development (e.g., `http://localhost:3000/payment-return`).

## ☁️ Deployment

The application is containerized using Docker and is currently deployed on **Microsoft Azure**. The live instance is accessible via its public IP: `http://20.198.225.85`.

Future improvements may include setting up a DNS record for a custom domain name.

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📜 License

Distributed under the MIT License. See `LICENSE` file for more information.
_(Create a LICENSE file with the MIT license text if you don't have one)_

---

**Author:** [Your Name/Organization Name]
**GitHub:** [Your GitHub Profile/Organization Link]
