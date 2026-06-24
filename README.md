# 🚀 Cossack International

Full-stack, premium e-commerce application featuring a modern **React + Vite** frontend and support for **two interchangeable backend implementations**: **FastAPI (Python)** or **Laravel (PHP)**. Developers can hot-swap the backend depending on their preference or system requirements, as both APIs conform to the same routing structure.

---

## 👥 Developers & Contributors

This project is developed and maintained by:
* 🧑‍💻 **Ali Mirza** — Full-stack Developer
* 🧑‍💻 **Aamir Malik** — Full-stack Developer

---

## 🎨 Technology Stack & Features

### 🛍️ Frontend (`Front-end/`)
* **Framework**: React 19 (TypeScript, Vite)
* **Styling**: Tailwind CSS for responsive and modern layouts
* **Interactions**: Polished UI with skeleton loaders, spinner animations, hover effects, and custom transitions
* **Media**: Image gallery slider support powered by Swiper
* **State & Routing**: React Router DOM (v7) and React Context API for global state management

### ⚙️ Backend Options

You can run **either** backend; the React frontend is compatible with both.

#### Option A: FastAPI Backend (`Back-end/app/`)
* **Framework**: FastAPI (Python 3.12+)
* **Database**: PostgreSQL with SQLAlchemy ORM
* **Migrations**: Alembic migrations workflow
* **Security**: JWT-based authentication using custom HS256 tokens and bcrypt-hashed passwords
* **Media Uploads**: Cloudinary integration for product images

#### Option B: Laravel Backend (`Back-end-laravel/`)
* **Framework**: Laravel 11 (PHP 8.2+)
* **Database**: Supported on MySQL, SQLite, or PostgreSQL
* **Security**: Laravel Sanctum API token authentication and Laravel Hash utilities
* **Media Uploads**: Cloudinary integration for product images

---

## 📂 Repository Structure

```text
├── Front-end/                  # React + Vite + TypeScript application
│   ├── src/
│   │   ├── api/                # API client & request services
│   │   ├── context/            # Auth & shopping context providers
│   │   ├── pages/              # Client & Admin dashboard pages
│   │   └── main.tsx            # React app entry point
│   └── vite.config.ts          # Vite configuration & dev proxy
│
├── Back-end/                   # FastAPI implementation
│   └── app/
│       ├── auth/               # JWT token generation & password utilities
│       ├── database/           # DB engine & session local dependency
│       ├── routes/             # FastAPI routers for admin, users, cart, and orders
│       ├── migrations/         # Alembic migration versions
│       └── main.py             # FastAPI server entry point
│
└── Back-end-laravel/           # Laravel implementation
    ├── app/Http/Controllers/   # Controllers matching FastAPI API endpoints
    ├── database/migrations/    # DB migrations matching the Postgres schema
    └── routes/api.php          # Unified Laravel API routing
```

---

## 🚀 Getting Started

### 1. Frontend Setup

1. Open your terminal and navigate to the frontend directory:
   ```bash
   cd Front-end
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and set the target backend API base URL:
   ```bash
   cp .env.example .env
   ```
   * **For FastAPI Backend**:
     ```env
     VITE_API_BASE_URL=http://127.0.0.1:8000
     ```
   * **For Laravel Backend**:
     ```env
     VITE_API_BASE_URL=http://127.0.0.1:8000/api
     ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:5173`.

---

### 2. Backend Setup (Choose One)

Choose the backend implementation you want to run. Both backends share matching endpoints, authentication middleware, and database schemas.

---

### 🐍 Choice 1: FastAPI (Python)

#### Prerequisites
* Python 3.12+ installed
* PostgreSQL database service running

#### Setup Steps
1. Navigate to the FastAPI backend directory:
   ```bash
   cd Back-end/app
   ```
2. Initialize and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # On macOS/Linux:
   source .venv/bin/activate
   # On Windows:
   .venv\Scripts\activate
   ```
3. Install package dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` configuration file in `Back-end/app/.env`:
   ```env
   DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/cossack_db
   SECRET_KEY=cossackInternational
   CLOUD_NAME=your_cloudinary_cloud_name
   API_KEY=your_cloudinary_api_key
   CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
   ```
5. Apply database schema migrations via Alembic:
   ```bash
   alembic upgrade head
   ```
6. Spin up the development server:
   ```bash
   uvicorn main:app --reload
   ```
   The FastAPI app will run on `http://127.0.0.1:8000`. You can visit interactive docs at `http://127.0.0.1:8000/docs`.

---

### 🟠 Choice 2: Laravel (PHP)

#### Prerequisites
* PHP 8.2+ installed
* Composer package manager installed
* MySQL, PostgreSQL, or SQLite database running

#### Setup Steps
1. Navigate to the Laravel backend directory:
   ```bash
   cd Back-end-laravel
   ```
2. Install Composer dependencies:
   ```bash
   composer install
   ```
3. Copy `.env.example` to create your environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Generate the application cipher key:
   ```bash
   php artisan key:generate
   ```
5. Edit your `.env` file to configure your database (`DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) and Cloudinary settings:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=cossack_db
   DB_USERNAME=root
   DB_PASSWORD=your_password

   CLOUD_NAME=your_cloudinary_cloud_name
   API_KEY=your_cloudinary_api_key
   CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
   ```
6. Run database migrations:
   ```bash
   php artisan migrate
   ```
7. Start the local server:
   ```bash
   php artisan serve
   ```
   By default, the Laravel server runs on `http://127.0.0.1:8000`. The API routes will be accessible under `/api`.

---

## 🛠️ API Routing Architecture

Both backends implement the exact same routing signature, making switching between them seamless for the frontend client:

### 🔐 Auth Endpoints
* `POST /auth/register` — Register a new customer
* `POST /auth/login` — Login and receive authorization token (JWT/Sanctum)
* `GET /auth/me` — Retrieve currently logged-in user context

### 🛒 Customer Shopping Flows
* **Products**:
  * `GET /user/products/` — List all active products
  * `GET /user/products/{product_id}` — Get single product details
* **Categories**:
  * `GET /categories/` — List all categories
  * `GET /categories/{category_id}` — Fetch details of a category
* **Cart**:
  * `GET /cart/` — Fetch current user cart items
  * `POST /cart/add` — Add item to cart (supports variants & configurations)
  * `PATCH /cart/item/{cart_item_id}/quantity` — Update cart item quantity
  * `DELETE /cart/{cart_item_id}` — Remove item from cart
  * `DELETE /cart/clear` — Empty the cart
* **Orders**:
  * `POST /order/` — Checkout and create order from cart
  * `GET /order/my` — Fetch current customer's order history
  * `GET /order/{order_id}` — Fetch detailed invoice of an order

### 🧑‍💼 Admin Dashboard
* **Categories**:
  * `POST /categories/post-category` — Create a new category
  * `PUT /categories/{category_id}` — Update category info
  * `DELETE /categories/{category_id}` — Soft delete category
* **Products**:
  * `POST /admin/products/full` — Create product with variations and image configurations
  * `GET /admin/products/` — List all products for management
  * `GET /admin/products/{product_id}` — Fetch product for edit form
  * `PUT /admin/products/{product_id}` — Update product details
  * `DELETE /admin/products/{product_id}` — Archive product
  * `POST /admin/products/{product_id}/restore` — Unarchive product
* **Orders**:
  * `GET /admin/order/` — Retrieve all orders across the platform
  * `PUT /admin/order/{order_id}` — Update order status (Pending, Processing, Shipped, Delivered)


