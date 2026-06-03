from datetime import datetime
from decimal import Decimal
from typing import Any, Optional,List
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
    image_url: Optional[str] = None
    is_primary: bool = False


class VariantCreate(BaseModel):
    color: str
    stock: int = 0
    images: list[VariantImageCreate] = Field(default_factory=list)
    price_modifier: Decimal = 0



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
    price_modifier: Decimal
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
    created_at: Optional[datetime] = None
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


#Update Schemas


class StaticConfigUpdate(BaseModel):
    id: Optional[UUID] = None
    key: Optional[str] = None
    value: Optional[str] = None
    

class ConfigOptionUpdate(BaseModel):
    id: Optional[UUID] = None
    value: Optional[str] = None
    price_modifier: Optional[Decimal] = None
    
    
class DynamicConfigUpdate(BaseModel):
    id: Optional[UUID] = None
    name: Optional[str] = None
    type: Optional[str] = None
    options: Optional[List[ConfigOptionUpdate]] = []
    

class VariantImageUpdate(BaseModel):
    id: Optional[UUID] = None
    image_url: Optional[str] = None
    is_primary: Optional[bool] = None
    
class VariantUpdate(BaseModel):
    id: Optional[UUID] = None
    color: Optional[str] = None
    stock: Optional[int] = None
    images: Optional[List[VariantImageUpdate]] = []
    
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[Decimal] = None
    category_id: Optional[UUID] = None
    base_image: Optional[str] = None

    static_configs: Optional[List[StaticConfigUpdate]] = []
    dynamic_configs: Optional[List[DynamicConfigUpdate]] = []
    variants: Optional[List[VariantUpdate]] = []
    
