from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from schemas.product_schema import ProductOut
from utils.helping_funcs import load_product, public_products_query
from uuid import UUID

router = APIRouter()


@router.get("/", response_model=list[ProductOut])
def list_user_products(db: Session = Depends(get_db)):
    return public_products_query(db).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: UUID, db: Session = Depends(get_db)):
    product = load_product(db, product_id, is_del=False, public_only=True)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
