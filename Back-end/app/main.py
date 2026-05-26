from fastapi import FastAPI

import utils.cloudinary_config

from routes.auth_routes import router as auth_router
from routes.user_routes import router as user_router
from routes.category_routes import router as category_router
from routes.product_routes import router as product_router
from routes.admin_product_routes import router as admin_product_router
from routes.cart_routes import router as cart_router

app = FastAPI()


# Include Routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/users", tags=["User"])
app.include_router(category_router, prefix="/categories", tags=["Category"])
app.include_router(product_router, prefix="/products", tags=["Product"])
app.include_router(admin_product_router, prefix="/admin", tags=["Admin"])
app.include_router(cart_router, prefix="/cart", tags=["Cart"])
