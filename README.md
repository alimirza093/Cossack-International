👨‍💻 Dev 1 — User Flow (Frontend Facing APIs)
🔐 Auth
POST /auth/register
👉 New user create karna

input: name, email, password

output: user + token

POST /auth/login
👉 User login

input: email, password

output: JWT token

GET /auth/me
👉 Current logged-in user data

token se user fetch

🛍️ Products (Read Only)
GET /products
👉 All products list (pagination + filters optional)

GET /products/{id}
👉 Single product detail page

📂 Categories
GET /categories
👉 All categories list (frontend menu ke liye)

🛒 Cart
GET /cart
👉 Current user ka cart

items + total price

POST /cart/add
👉 Product cart me add karna

input: product_id, quantity

DELETE /cart/remove/{id}
👉 Cart item remove karna

📦 Orders (User Side)
POST /orders
👉 Order place karna (COD)

input: address, phone, cart items

internally:

cart → order convert

total calculate

status = pending

GET /orders/my
👉 Current user ke orders list

GET /orders/{id}
👉 Single order detail

👨‍💻 Dev 2 — Admin + Control
👤 User Profile
GET /users/profile
👉 User apna profile dekh sakta hai

PUT /users/profile
👉 User apni info update kare

name, phone, address

🛍️ Products (Admin Control)
POST /products
👉 New product create

name, price, image, category

PUT /products/{id}
👉 Product update karna

DELETE /products/{id}
👉 Product delete karna

📂 Categories (Admin)
POST /categories
👉 New category create

📦 Admin Orders
GET /admin/orders
👉 Sare orders (dashboard)

filters: pending, shipped, delivered

PUT /admin/orders/{id}
👉 Order status update

pending → confirmed → shipped → delivered
📊 Admin Stats
GET /admin/stats
👉 Dashboard metrics

total orders

total revenue

total users

recent orders

🧠 Important Logic Responsibilities
🔥 Order Endpoint (Critical)
👉 POST /orders me ye sab hona chahiye:

cart fetch

stock check (optional MVP)

total calculate

order + order_items create

cart clear

🔥 Cart Logic
👉 POST /cart/add

agar item already exist → quantity update

warna new item create

🔥 Admin Security
👉 ye endpoints protected hone chahiye:

POST /products
PUT /products
DELETE /products
/admin/*
👉 sirf is_admin = true users access karein

⚡ Final Summary
👉 Dev 1 = user journey (browse → cart → order)
👉 Dev 2 = admin control + data management

👉 Har endpoint ka clear role = no confusion + fast development 🚀


