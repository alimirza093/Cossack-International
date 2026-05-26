from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session, joinedload

from auth.jwt_handler import verify_token
from database.db import get_db
from model.db_models import Cart, CartItem, Product, ProductConfig, ProductVariant, User
from schemas.cart_schema import CartItemCreate, CartItemOut, CartOut
from schemas.product_schema import ProductOut
from utils.pricing import calculate_price
from utils.uuid_utils import parse_uuid

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.get("/cart", response_model=CartOut)
def get_cart(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid Token")

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()

def _load_product(db: Session, product_id: UUID) -> Product | None:
    return (
        db.query(Product)
        .options(joinedload(Product.configs).joinedload(ProductConfig.options))
        .filter(Product.id == product_id)
        .first()
    )


@router.get("/cart", response_model=CartOut)
def get_cart(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid Token")

    user_id = parse_uuid(payload.get("user_id"))
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid Token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this id is not found")

    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    cart_items = (
        db.query(CartItem)
        .options(
            joinedload(CartItem.product).joinedload(Product.configs),
            joinedload(CartItem.variant),
        )
        .filter(CartItem.cart_id == cart.id)
        .all()
    )

    pydantic_items = []
    total_price = 0

    for db_item, db_product in cart_items:
        # Calculate item line price
        item_total = db_product.price * db_item.quantity
        total_price += item_total

        # Build ProductOut structure (this can use from_attributes if left on ProductOut)
        product_data = ProductOut.model_validate(db_product)

        # Append to items list
    total_price = Decimal("0")

    for db_item in cart_items:
        line_total = Decimal(db_item.final_price) * db_item.quantity
        total_price += line_total

        product_data = ProductOut.model_validate(db_item.product)
        pydantic_items.append(
            CartItemOut(
                id=db_item.id,
                quantity=db_item.quantity,
                product=product_data,
                variant_id=db_item.variant_id,
                selected_options=db_item.selected_options or {},
                final_price=db_item.final_price,
                created_at=db_item.created_at,
            )
        )

    return CartOut(
        id=cart.id,
        user_id=cart.user_id,
        items=pydantic_items,
        total_price=total_price,
        created_at=cart.created_at,
    )


@router.post("/add")
def add_cart_item(
    data: CartItemCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid Token")

    user_id = payload.get("user_id")

    product = db.query(Product).filter(Product.id == data.product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock < data.quantity:
        raise HTTPException(
            status_code=400, detail=f"Only {product.stock} items available in stock"
        )

    cart = db.query(Cart).filter(Cart.user_id == user_id).first()

    user_id = parse_uuid(payload.get("user_id"))
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid Token")

    product = _load_product(db, data.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    variant = (
        db.query(ProductVariant)
        .filter(
            ProductVariant.id == data.variant_id,
            ProductVariant.product_id == data.product_id,
        )
        .first()
    )
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found for this product")

    if variant.stock < data.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {variant.stock} items available in stock",
        )

    unit_price = calculate_price(product, data.selected_options)

    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.flush()

    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == data.product_id,
            CartItem.variant_id == data.variant_id,
            CartItem.selected_options == data.selected_options,
        )
        .first()
    )

    if cart_item:
        new_quantity = cart_item.quantity + data.quantity
        if variant.stock < new_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot exceed available stock {variant.stock}",
            )
        cart_item.quantity = new_quantity
        cart_item.final_price = unit_price
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=data.product_id,
            variant_id=data.variant_id,
            selected_options=data.selected_options,
            final_price=unit_price,
            quantity=data.quantity,
        )
        db.add(cart_item)

    db.commit()
    return {"message": "Product successfully added to cart", "final_price": unit_price}


@router.delete("/remove/{cart_item_id}")
def remove_from_cart(
    cart_item_id: UUID,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid Token")

    user_id = parse_uuid(payload.get("user_id"))
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid Token")

    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    cart_item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id)
        .first()
    )

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    db.delete(cart_item)
    db.commit()
    return {"message": "Product successfully removed from cart"}
