from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from schemas.cart_schema import CartOut, ProductOut, CartItemOut, CartItemCreate
from database.db import get_db
from auth.jwt_handler import verify_token
from model.db_models import User, Cart, CartItem, Product

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.get("/cart", response_model=CartOut)
def get_cart(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid Token")

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User with this id is not found")

    cart = db.query(Cart).filter(Cart.user_id == user_id).first()

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    cart_items = (
        db.query(CartItem, Product)
        .join(Product, CartItem.product_id == Product.id)
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
        pydantic_items.append(
            CartItemOut(
                id=db_item.id,
                quantity=db_item.quantity,
                product=product_data,
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
    token: Session = Depends(get_db),
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

    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.flush()

    cart_item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == data.product_id)
        .first()
    )

    if cart_item:

        new_quantity = cart_item.quantity + data.quantity
        if product.stock < new_quantity:
            raise HTTPException(
                status_code=400, detail=f"Cannot exceed available stock {product.stock}"
            )
        cart_item.quantity = new_quantity
    else:

        cart_item = CartItem(
            cart_id=cart.id, product_id=data.product_id, quantity=data.quantity
        )
        db.add(cart_item)

    db.commit()
    return {"message": "Product successfully added to cart"}


@router.delete("/remove/{product_id}")
def remove_from_cart(
    product_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid Token")

    user_id = payload.get("user_id")

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
