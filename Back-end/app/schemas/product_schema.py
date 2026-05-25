from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    stock: int
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    
    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category_id: int
    stock: int 
    
