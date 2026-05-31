from uuid import UUID
from schemas.category_schema import CategoryCreate
from fastapi import APIRouter, Depends, HTTPException
from schemas.category_schema import CateOut
from sqlalchemy.orm import Session
from database.db import get_db
from model.db_models import Category
from utils.helping_funcs import admin_required

router = APIRouter()


@router.get("/", response_model=list[CateOut])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()

    return categories


@router.get("/categories/{category_id}", response_model=CateOut)
def get_category_by_id(category_id: UUID, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return category


@router.post("/post-category")
def create_category(data: CategoryCreate, db: Session = Depends(get_db), admin = Depends(admin_required)):
    category = Category(
        name=data.name
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return {"message": "Category created successfully", "category": category}


@router.put("/update-category/{category_id}")
def update_category(category_id: UUID,data: CategoryCreate, db: Session = Depends(get_db) , admin = Depends(admin_required)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category.name = data.name
    db.commit()
    db.refresh(category)
    return {"message": "Category updated successfully", "category": category}


@router.delete("/delete-category/{category_id}")
def delete_category(category_id: UUID, db: Session = Depends(get_db) , admin = Depends(admin_required)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}

