from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from schemas.auth_schema import UserCreate, UserLogin, UserOut
from sqlalchemy.orm import Session
from database.db import get_db
from model.db_models import User
from auth.password import hash_password, verify_password
from auth.jwt_handler import create_access_token as create_token
from utils.helping_funcs import get_current_user

router = APIRouter()


@router.post("/register")
def register(data: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(data.password) < 8:
        raise HTTPException(
            status_code=400, detail="Password must be at least 8 characters long"
        )
    if len(data.first_name) < 2 or len(data.last_name) < 2:
        raise HTTPException(
            status_code=400,
            detail="First name and last name must be at least 2 characters long",
        )
    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role="user",
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    return {"message": "User registered successfully"}


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_token({"user_id": str(user.id), "role": user.role})

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
