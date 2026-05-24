from fastapi import APIRouter, Depends, HTTPException
from schemas.product_schema import ProductOut
from sqlalchemy.orm import Session
from database.db import get_db
from model.db_models import Product

router = APIRouter()


@router.get("/products", response_model=list[ProductOut])
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()

    return products


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product
