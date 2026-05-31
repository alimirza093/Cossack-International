from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from model.db_models import Product
from schemas.product_schema import ProductOut
from utils.helping_funcs import PRODUCT_LOAD_OPTIONS , load_product
from uuid import UUID

router = APIRouter()


@router.get("/" , response_model=list[ProductOut])
def list_user_products(
    db: Session = Depends(get_db),
    is_deleted: bool = False
):
    query = db.query(Product).options(*PRODUCT_LOAD_OPTIONS)
    query = query.filter(Product.is_deleted == is_deleted)
    return query.all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    is_delete: bool = False,
):
    product = load_product(db, product_id, is_del=is_delete)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")    
    return product