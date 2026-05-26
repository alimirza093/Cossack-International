from uuid import UUID

from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str 
    
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    


class UserOut(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True
        

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
    
class TokenData(BaseModel):
    user_id: UUID
    role: str
