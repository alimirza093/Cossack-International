from datetime import datetime
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from schemas.product_schema import ProductOut


class SelectedOptionOut(BaseModel):
    config_id: UUID
    config_name: str
    option_id: UUID
    option_value: str
    price_modifier: Decimal
    
    class Config:
        from_attributes = True


class VariantCartOut(BaseModel):
    id: UUID
    color: str
    stock: int
    price_modifier: Decimal

    class Config:
        from_attributes = True


class CartItemOut(BaseModel):
    id: UUID
    product: ProductOut
    variant: Optional[VariantCartOut] = None
    selected_options: list[SelectedOptionOut] = Field(default_factory=list)
    quantity: int
    final_price: Decimal
    item_total: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class CartOut(BaseModel):
    id: Optional[UUID] = None
    user_id: UUID
    grand_total: Decimal
    items: list[CartItemOut] = Field(default_factory=list)
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class selectedOption(BaseModel):
    config_id: UUID
    option_id: UUID


class CartItemCreate(BaseModel):
    product_id: UUID
    variant_id: UUID
    selected_options: list[selectedOption]
    quantity: int = Field(default=1, ge=1)


class UpdateQuantity(BaseModel):
    quantity: int = Field(gt=0)
