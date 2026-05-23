from fastapi import FastAPI

from routes.auth_routes import router as auth_router


app = FastAPI()


# Include Routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
