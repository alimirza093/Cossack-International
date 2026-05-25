from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import get_db
from utils.helping_funcs import admin_required
from model.db_models import Category
router = APIRouter()

@router.post("/post-category")
def create_category(name: str, db: Session = Depends(get_db), admin = Depends(admin_required)):
    category = Category(name=name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return {"message": "Category created successfully", "category": category}

@router.get("/list-categories")
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return categories