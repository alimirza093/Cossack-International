from fastapi import FastAPI

from routes.auth_routes import router as auth_router
from routes.category_routes import router as category_router
from routes.product_routes import router as product_router
from routes.cart_routes import router as cart_router

app = FastAPI()


# Include Routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(category_router, prefix="/category", tags=["Category"])
app.include_router(product_router, prefix="/product", tags=["Product"])
app.include_router(cart_router, prefix="/cart", tags=["Cart"])
