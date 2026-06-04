from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from schemas.product_schema import ProductOut
from enum import Enum


PAYMENT_METHOD_COD = "cash_on_delivery"
PAYMENT_METHOD_COD_LABEL = "Cash on Delivery"


class OrderStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class UpdateOrderStatus(BaseModel):
    status: OrderStatus


class VariantOrderOut(BaseModel):
    id: UUID
    color: str
    price_modifier: Decimal

    class Config:
        from_attributes = True


class SelectedOrderOptionOut(BaseModel):
    config_id: UUID
    config_name: str
    option_id: UUID
    option_value: str
    price_modifier: Decimal

    class Config:
        from_attributes = True


class OrderItemOut(BaseModel):
    id: UUID
    product: Optional[ProductOut] = None
    variant: Optional[VariantOrderOut] = None
    selected_options: list[SelectedOrderOptionOut] = Field(default_factory=list)
    quantity: int
    final_price: Decimal
    item_total: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: UUID
    user_id: UUID
    total_price: Decimal
    delivery_address: str
    payment_method: str
    status: str
    items: list[OrderItemOut] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True


class CreateOrderRequest(BaseModel):
    cart_item_ids: list[UUID]
    delivery_address: str
