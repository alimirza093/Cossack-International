from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import get_db
from utils.helping_funcs import get_current_user
from model.db_models import User
from schemas.user_schema import UserProfileOut, UserProfileUpdate


router = APIRouter()

@router.get("/profile", response_model=UserProfileOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user



@router.put("/profile", response_model=UserProfileOut)
def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.first_name = data.first_name
    current_user.last_name = data.last_name
    current_user.phone_number = data.phone_number
    current_user.address = data.address

    db.commit()
    db.refresh(current_user)

    return current_user