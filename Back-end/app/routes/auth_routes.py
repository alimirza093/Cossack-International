from fastapi import APIRouter, Depends, HTTPException
from schemas.auth_schema import UserCreate, UserLogin ,UserOut, Token, TokenData
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database.db import get_db
from model.db_models import User
from auth.password import hash_password, verify_password
from auth.jwt_handler import create_access_token as create_token, verify_token, verify_token

router = APIRouter()

@router.post("/register")
def register(data : UserCreate, db: Session = Depends(get_db)):
    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role="user"
    )
    db.add(user)
    db.commit()
    return {"message": "User registered successfully"}


@router.post("/login")
def login(data : UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_token({"user_id": str(user.id), "role": user.role})

    return {"message": "Login successful", "access_token": token, "token_type": "bearer"}




oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@router.get("/me", response_model=UserOut)
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    payload = verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    from utils.uuid_utils import parse_uuid

    user_id = parse_uuid(payload.get("user_id"))
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


