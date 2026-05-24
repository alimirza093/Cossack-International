from fastapi import APIRouter, Depends, HTTPException
from schemas.category_schema import CateOut
from sqlalchemy.orm import Session
from database.db import get_db
from model.db_models import Category

router = APIRouter()


@router.get("/categories", response_model=list[CateOut])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()

    return categories


@router.get("/categories/{category_id}", response_model=CateOut)
def get_product_by_id(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return category
