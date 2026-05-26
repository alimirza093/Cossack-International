from datetime import datetime
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from schemas.product_schema import ProductOut


class CartItemOut(BaseModel):
    id: UUID
    quantity: int
    product: ProductOut
    variant_id: Optional[UUID] = None
    selected_options: dict[str, Any] = Field(default_factory=dict)
    final_price: Decimal
    created_at: datetime


class CartOut(BaseModel):
    id: UUID
    user_id: UUID
    items: list[CartItemOut]
    total_price: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class CartItemCreate(BaseModel):
    product_id: UUID
    variant_id: UUID
    selected_options: dict[str, Any] = Field(default_factory=dict)
    quantity: int = Field(default=1, ge=1)
