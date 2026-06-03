from uuid import UUID
from schemas.category_schema import CategoryCreate
from fastapi import APIRouter, Depends, HTTPException
from schemas.category_schema import CateOut
from sqlalchemy.orm import Session
from database.db import get_db
from model.db_models import Category
from utils.helping_funcs import admin_required

router = APIRouter()


def _get_category_or_404(db: Session, category_id: UUID, *, include_deleted: bool = False) -> Category:
    query = db.query(Category).filter(Category.id == category_id)
    if not include_deleted:
        query = query.filter(Category.is_deleted.is_(False))
    category = query.first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.get("/", response_model=list[CateOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.is_deleted.is_(False)).all()


@router.get("/categories/{category_id}", response_model=CateOut)
def get_category_by_id(category_id: UUID, db: Session = Depends(get_db)):
    return _get_category_or_404(db, category_id)


@router.post("/post-category")
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    existing = (
        db.query(Category)
        .filter(Category.name == data.name, Category.is_deleted.is_(False))
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Category name already exists")

    category = Category(name=data.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return {"message": "Category created successfully", "category": category}


@router.put("/update-category/{category_id}")
def update_category(
    category_id: UUID,
    data: CategoryCreate,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    category = _get_category_or_404(db, category_id)
    category.name = data.name
    db.commit()
    db.refresh(category)
    return {"message": "Category updated successfully", "category": category}


@router.delete("/delete-category/{category_id}")
def delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.is_deleted:
        raise HTTPException(status_code=404, detail="Category not found")
    category.is_deleted = True
    db.commit()
    return {"message": "Category deleted successfully"}
