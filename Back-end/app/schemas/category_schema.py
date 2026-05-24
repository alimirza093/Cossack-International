from pydantic import BaseModel


class CateOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
