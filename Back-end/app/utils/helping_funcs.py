from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from model.db_models import User
from auth.jwt_handler import verify_token
from fastapi.security import OAuth2PasswordBearer
import cloudinary.uploader


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    payload = verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("user_id")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user



def admin_required(current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user


def upload_image(file):
    result = cloudinary.uploader.upload(file)
    return result.get("secure_url")