from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from model.db_models import ConfigType
from schemas.category_schema import CateOut


# --- Nested create payloads (admin full product) ---


class StaticConfigCreate(BaseModel):
    key: str
    value: str


class ConfigOptionCreate(BaseModel):
    value: str
    price_modifier: Decimal = Decimal("0")


class DynamicConfigCreate(BaseModel):
    name: str
    type: ConfigType = ConfigType.custom
    options: list[ConfigOptionCreate] = Field(default_factory=list)


class VariantImageCreate(BaseModel):
    image_url: str
    is_primary: bool = False


class VariantCreate(BaseModel):
    color: str
    stock: int = 0
    images: list[VariantImageCreate] = Field(default_factory=list)


class ProductFullCreate(BaseModel):

    name: str
    description: str
    base_price: Decimal
    category_id: UUID
    base_image: Optional[str] = None
    static_configs: list[StaticConfigCreate] = Field(default_factory=list)
    dynamic_configs: list[DynamicConfigCreate] = Field(default_factory=list)
    variants: list[VariantCreate] = Field(default_factory=list)


# --- Response schemas ---


class ProductImageOut(BaseModel):
    id: UUID
    image_url: str
    is_primary: bool

    class Config:
        from_attributes = True


class ProductVariantOut(BaseModel):
    id: UUID
    color: str
    stock: int
    images: list[ProductImageOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


class ProductConfigOptionOut(BaseModel):
    id: UUID
    value: str
    price_modifier: Decimal

    class Config:
        from_attributes = True


class ProductConfigOut(BaseModel):
    id: UUID
    name: str
    type: ConfigType
    options: list[ProductConfigOptionOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


class ProductStaticConfigOut(BaseModel):
    id: UUID
    key: str
    value: str

    class Config:
        from_attributes = True


class ProductOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    base_price: Decimal
    base_image: Optional[str] = None
    category_id: Optional[UUID] = None
    category: CateOut = None
    static_configs: list[ProductStaticConfigOut] = Field(default_factory=list)
    configs: list[ProductConfigOut] = Field(default_factory=list)
    variants: list[ProductVariantOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    """Legacy minimal create — prefer ProductFullCreate for admin."""

    name: str
    description: str
    base_price: Decimal
    category_id: UUID
