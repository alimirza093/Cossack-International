from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import utils.cloudinary_config

from routes.auth_routes import router as auth_router
from routes.user_routes import router as user_router
from routes.category_routes import router as category_router
from routes.product_routes import router as product_router
from routes.admin_product_routes import router as admin_product_router
from routes.cart_routes import router as cart_router
from routes.order_routes import router as order_router
from routes.admin_order_routes import router as admin_order_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/users", tags=["User"])
app.include_router(category_router, prefix="/categories", tags=["Category"])
app.include_router(product_router, prefix="/user/products", tags=["Product"])
app.include_router(admin_product_router, prefix="/admin/products", tags=["Admin"])
app.include_router(cart_router, prefix="/cart", tags=["Cart"])
app.include_router(order_router, prefix="/order", tags=["Order"])
app.include_router(admin_order_router, prefix="/admin/order", tags=["Admin"])
