from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from schemas.product_schema import ProductOut


class CartItemOut(BaseModel):
    id: int
    quantity: int
    product: ProductOut
    created_at: datetime


class CartOut(BaseModel):
    id: int
    user_id: int
    items: list[CartItemOut]
    total_price: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)
