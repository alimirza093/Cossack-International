from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from schemas.product_schema import ProductOut, ProductCreate
from sqlalchemy.orm import Session
from database.db import get_db
from model.db_models import Product
from utils.helping_funcs import admin_required , upload_image



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


@router.post("/create-product")
def create_product(
    db: Session = Depends(get_db),
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category_id: int = Form(...),
    stock: int = Form(...),
    image: UploadFile = File(None),
    admin = Depends(admin_required)
):
    if image:
        image_url = upload_image(image.file)
    else:
        image_url = None
    product = Product(
        name=name,
        description=description,
        price=price,
        category_id=category_id,
        stock=stock,
        image_url=image_url
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return {"message": "Product created successfully", "product": product}


    
@router.put("/update-product/{product_id}")
def update_product(
    product_id: int,
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category_id: int = Form(...),
    stock: int = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    admin = Depends(admin_required)   
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        return {"message": "Product not found"}
    image_url = product.image_url
    if image:
        image_url = upload_image(image.file)
        
    product.name = name
    product.description =  description
    product.price = price
    product.category_id = category_id
    product.stock = stock
    product.image_url = image_url
    db.commit()
    db.refresh(product)

    return {"message": "Product updated successfully", "product": product}



@router.delete("/delete-product/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin = Depends(admin_required)   
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        return {"message": "Product not found"}

    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}  
