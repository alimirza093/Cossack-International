from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session, joinedload

from database.db import get_db
from model.db_models import Product, ProductConfig, ProductVariant
from schemas.product_schema import ProductCreate, ProductOut
from utils.helping_funcs import admin_required, upload_image

router = APIRouter()


def _product_query(db: Session):
    return db.query(Product).options(
        joinedload(Product.static_configs),
        joinedload(Product.configs).joinedload(ProductConfig.options),
        joinedload(Product.variants).joinedload(ProductVariant.images),
    )


@router.get("/products", response_model=list[ProductOut])
def get_products(db: Session = Depends(get_db)):
    return _product_query(db).all()


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product_by_id(product_id: UUID, db: Session = Depends(get_db)):
    product = _product_query(db).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/create-product")
def create_product(
    db: Session = Depends(get_db),
    name: str = Form(...),
    description: str = Form(...),
    base_price: float = Form(...),
    category_id: UUID = Form(...),
    image: UploadFile = File(None),
    admin=Depends(admin_required),
):
    base_image = upload_image(image.file) if image else None
    product = Product(
        name=name,
        description=description,
        base_price=base_price,
        category_id=category_id,
        base_image=base_image,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return {"message": "Product created successfully", "product": product}


@router.put("/update-product/{product_id}")
def update_product(
    product_id: UUID,
    name: str = Form(...),
    description: str = Form(...),
    base_price: float = Form(...),
    category_id: UUID = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if image:
        product.base_image = upload_image(image.file)

    product.name = name
    product.description = description
    product.base_price = base_price
    product.category_id = category_id
    db.commit()
    db.refresh(product)
    return {"message": "Product updated successfully", "product": product}


@router.delete("/delete-product/{product_id}")
def delete_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}
