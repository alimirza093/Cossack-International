# 🚀 Cossack International

Fullstack e-commerce application with a React + Vite frontend and a FastAPI backend.

## ✨ Project overview

- 🛍️ Frontend: `Front-end/` — React, TypeScript, Vite, Tailwind CSS.
- ⚙️ Backend: `Back-end/app/` — FastAPI, SQLAlchemy, PostgreSQL, Alembic migrations, Cloudinary uploads.
- 🔐 Authentication: JWT-based user login/register flows.
- 🛒 Shopping flow: product catalog, configurable variants, cart, checkout, order history.
- 🧑‍💼 Admin panel: product management, order management, category CRUD.

## 🎨 UI & animation

- Tailwind-driven UI with hover transitions, skeleton loaders, and spinner animations.
- `animate-pulse`, `animate-spin`, and `transition-*` utility classes are used across pages.
- Swiper carousel support is available for image galleries and sliders.
- Responsive admin and customer pages with polished micro-interactions.

## Repository structure

- `Front-end/`
  - React app entrypoint: `src/main.tsx`
  - UI pages: `src/pages/`
  - API layer: `src/api/`
  - Context: `src/context/`
- `Back-end/app/`
  - `main.py` — FastAPI app with CORS and route registration
  - `routes/` — auth, user, category, product, admin product, cart, order, admin order
  - `database/db.py` — SQLAlchemy engine and session management
  - `migrations/` — Alembic migration scripts
  - `utils/cloudinary_config.py` — Cloudinary setup

## Backend setup

1. Open a terminal and navigate to the backend folder:

```bash
cd Back-end/app
```

2. Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Add a `.env` file in `Back-end/app/` with the required environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/cossack_db
SECRET_KEY=some-strong-secret
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
```

5. Run the backend:

```bash
uvicorn main:app --reload
```

The API will start on `http://127.0.0.1:8000`.

## Frontend setup

1. Open a terminal and navigate to the frontend folder:

```bash
cd Front-end
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` by default.

## Supported API routes

### Auth
- `POST /auth/register` — register a new user
- `POST /auth/login` — login and receive JWT
- `GET /auth/me` — get current authenticated user

### User profile
- `GET /users/profile` — fetch current user profile
- `PUT /users/profile` — update profile

### Categories
- `GET /categories/` — list categories
- `GET /categories/categories/{category_id}` — get category details
- `POST /categories/post-category` — create category
- `PUT /categories/update-category/{category_id}` — update category
- `DELETE /categories/delete-category/{category_id}` — delete category

### Products
- `GET /user/products/` — list products for users
- `GET /user/products/{product_id}` — get product details

### Cart
- `GET /cart/` — get current cart
- `POST /cart/add` — add item to cart
- `DELETE /cart/{cart_item_id}` — remove cart item
- `DELETE /cart/clear` — clear cart
- `PATCH /cart/item/{cart_item_id}/quantity` — update cart item quantity

### Orders
- `POST /order/` — create an order from cart
- `GET /order/my` — list current user orders
- `GET /order/{order_id}` — get order details

### Admin
- `POST /admin/products/full` — create product with variants and configs
- `GET /admin/products/` — list admin products
- `GET /admin/products/{product_id}` — get product data for edit
- `PUT /admin/products/{product_id}` — update product
- `DELETE /admin/products/{product_id}` — delete product
- `POST /admin/products/{product_id}/restore` — restore deleted product
- `GET /admin/order/` — list all orders
- `PUT /admin/order/{order_id}` — update order status

## Notes

- Backend CORS allows local frontend development on `http://localhost:5173` and `http://127.0.0.1:5173`.
- The backend uses `.env` values in `database/db.py`, `auth/jwt_handler.py`, and `utils/cloudinary_config.py`.
- Product configuration and cart payloads support variant selection, custom config options, and size breakdown data.

## Development tips

- Run the backend from `Back-end/app`.
- Run the frontend from `Front-end`.
- Use the FastAPI docs at `http://127.0.0.1:8000/docs` after starting the backend.

