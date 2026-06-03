from uuid import UUID

from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserProfileOut(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    role: str
    created_at: datetime
    phone_number: str | None = None
    address: str | None = None

    class Config:
        orm_mode = True
        
        
class UserProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    address: str 