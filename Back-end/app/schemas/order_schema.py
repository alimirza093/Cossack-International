from datetime import datetime
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from schemas.product_schema import ProductOut


class OrderItemOut(BaseModel):
    id: UUID
    quantity: int
    product: Optional[ProductOut] = None
    variant_id: Optional[UUID] = None
    selected_options: dict[str, Any] = Field(default_factory=dict)
    final_price: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: UUID
    user_id: UUID
    total_price: Decimal
    status: str
    items: list[OrderItemOut] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True
