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
