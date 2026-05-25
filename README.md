<<<<<<< HEAD
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


=======
👨‍💻 DEV 1 — USER SIDE (Frontend Flow)
👉 focus: customer journey

🔐 Auth
POST /auth/register → user create

POST /auth/login → JWT login

GET /auth/me → current user

🛍️ Products (UPDATED STRUCTURE)
GET /products
👉 list all products with:

variants (color + stock)

configs (fabric etc)

GET /products/{id}
👉 single product detail
👉 frontend yahan se:

colors dropdown

configs dropdown

size matrix UI build karega

🛒 Cart (UPDATED 🔥)
POST /cart/add
👉 full structure save karega:

variant_id (color)

selected_configurations

size_breakdown

GET /cart
👉 full nested cart (configs + sizes + roster)

DELETE /cart/{id}
👉 remove item

📦 Orders
POST /orders
👉 cart → order (snapshot copy)

GET /orders/my
👉 user orders

GET /orders/{id}
👉 single order

👨‍💻 DEV 2 — ADMIN SIDE (CONTROL PANEL 🔥)
👉 focus: data + system control

🛍️ Products (CORE 🔥)
POST /admin/products/full
👉 create:

product

variants

configs

GET /admin/products
👉 full nested listing:

product

variants

configs

GET /admin/products/{id}
👉 edit page ke liye full data

PUT /admin/products/{id}
👉 update:

basic info

variants (replace/update)

configs

DELETE /admin/products/{id}
👉 delete product + cascade

🎨 Variants (optional separate control)
PUT /admin/variants/{id}
👉 stock update

⚙️ Configs
POST /admin/products/{id}/configs
👉 add new config

DELETE /admin/configs/{id}
👉 remove config

📦 Orders (Admin)
GET /admin/orders
👉 all orders

PUT /admin/orders/{id}
👉 update status

📊 Stats
GET /admin/stats
👉 dashboard

🧠 SCHEMA UPDATE GUIDE (IMPORTANT 🔥)
🛒 CartItem (UPDATE REQUIRED)
variant_id = Column(Integer, ForeignKey("product_variants.id"))

selected_configurations = Column(JSON)

size_breakdown = Column(JSON)
📦 OrderItem (SAME COPY)
variant_id = Column(Integer)

selected_configurations = Column(JSON)

size_breakdown = Column(JSON)
🧠 Logic Rule
👉 Cart → flexible
👉 Order → snapshot (copy exact same data)

🔥 ADD TO CART FLOW (FINAL)
1. product fetch
2. user selects:
   - color → variant_id
   - configs
   - sizes
3. backend:
   - validate config options
   - check variant stock
   - save JSON
⚡ TEAM DIVISION (CLEAR)
✅ Dev 1
Auth

Product GET APIs

Cart

Orders (user side)

✅ Dev 2
Product create/update (full endpoint 🔥)

Variants

Configs

Admin orders

Stats
>>>>>>> Ali
