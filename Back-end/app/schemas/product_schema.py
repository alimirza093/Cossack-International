from pydantic import BaseModel

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category_id: int
    stock: int 
    
