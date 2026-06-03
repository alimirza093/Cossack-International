from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from database.db import get_db
from model.db_models import (
    Cart,
    CartItem,
    Product,
    ProductConfig,
    ProductConfigOption,
    ProductVariant,
    User,
)
from schemas.cart_schema import CartItemCreate, CartOut, UpdateQuantity
from utils.helping_funcs import get_current_user, is_product_available, load_product

router = APIRouter()


def _reject_admin_cart(user: User) -> None:
    if user.role == "admin":
        raise HTTPException(status_code=403, detail="Admin accounts cannot use the cart")


@router.get("/", status_code=200, response_model=CartOut)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _reject_admin_cart(current_user)

    cart = (
        db.query(Cart)
        .options(
            joinedload(Cart.items).joinedload(CartItem.product),
            joinedload(Cart.items).joinedload(CartItem.variant),
        )
        .filter(Cart.user_id == current_user.id)
        .first()
    )

    if not cart:
        return {
            "user_id": current_user.id,
            "grand_total": Decimal("0.00"),
            "items": [],
        }

    return cart


@router.post("/add", status_code=201)
def add_to_cart(
    data: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _reject_admin_cart(current_user)
    user_id = current_user.id

    product = load_product(db, data.product_id, is_del=False, public_only=True)

    if not product or not is_product_available(product):
        raise HTTPException(status_code=403, detail="Not such product stored")

    variant = (
        db.query(ProductVariant)
        .filter(
            ProductVariant.id == data.variant_id,
            ProductVariant.product_id == data.product_id,
        )
        .first()
    )

    if not variant:
        raise HTTPException(status_code=403, detail="No such product variant is exist")

    selected_options_json = []
    largest_config_modifier = Decimal("0.0")

    for sel_opt in data.selected_options:
        config = (
            db.query(ProductConfig)
            .filter(
                ProductConfig.product_id == product.id,
                ProductConfig.id == sel_opt.config_id,
            )
            .first()
        )

        if not config:
            raise HTTPException(status_code=404, detail="Not such configuration exist")

        option = (
            db.query(ProductConfigOption)
            .filter(
                ProductConfigOption.id == sel_opt.option_id,
                ProductConfigOption.config_id == sel_opt.config_id,
            )
            .first()
        )

        if not option:
            raise HTTPException(status_code=404, detail="Not such option exist")

        selected_options_json.append(
            {
                "config_id": str(config.id),
                "config_name": config.name,
                "option_id": str(option.id),
                "option_value": option.value,
                "price_modifier": float(option.price_modifier),
            }
        )

        if Decimal(option.price_modifier) > largest_config_modifier:
            largest_config_modifier = Decimal(option.price_modifier)

    selected_options_json = sorted(
        selected_options_json,
        key=lambda x: (
            x["config_id"],
            x["option_id"],
        ),
    )

    cart = db.query(Cart).filter(Cart.user_id == user_id).first()

    if not cart:
        cart = Cart(user_id=user_id, grand_total=Decimal("0.00"))
        db.add(cart)
        db.commit()
        db.refresh(cart)

    existing_items = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id)
        .filter(CartItem.product_id == data.product_id)
        .filter(CartItem.variant_id == data.variant_id)
        .all()
    )

    matching_item = None

    for item in existing_items:
        existing_options = sorted(
            item.selected_options,
            key=lambda x: (
                x["config_id"],
                x["option_id"],
            ),
        )

        if existing_options == selected_options_json:
            matching_item = item
            break

    variant_modifier = Decimal(getattr(variant, "price_modifier", 0))

    final_price = Decimal(product.base_price) + max(
        variant_modifier,
        largest_config_modifier,
    )

    if matching_item:
        new_quantity = matching_item.quantity + data.quantity

        if new_quantity > variant.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Only {variant.stock} units available",
            )

        matching_item.quantity = new_quantity
        matching_item.final_price = final_price
        matching_item.item_total = final_price * new_quantity

        db.commit()
        db.refresh(matching_item)

    else:
        if data.quantity > variant.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Only {variant.stock} units available",
            )

        cart_item = CartItem(
            cart_id=cart.id,
            product_id=data.product_id,
            variant_id=data.variant_id,
            selected_options=selected_options_json,
            quantity=data.quantity,
            final_price=final_price,
            item_total=(final_price * data.quantity),
        )

        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)

    cart.grand_total = (
        db.query(
            func.coalesce(
                func.sum(CartItem.item_total),
                0,
            )
        )
        .filter(CartItem.cart_id == cart.id)
        .scalar()
    )

    db.commit()
    db.refresh(cart)

    return {
        "message": "Product added to cart",
        "grand_total": cart.grand_total,
        "cart_id": str(cart.id),
    }


@router.delete("/{cart_item_id}", status_code=200)
def del_cart_temp(
    cart_item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _reject_admin_cart(current_user)

    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found for this user")

    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.id == cart_item_id,
            CartItem.cart_id == cart.id,
        )
        .first()
    )

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.flush()

    cart.grand_total = (
        db.query(
            func.coalesce(
                func.sum(CartItem.item_total),
                0,
            )
        )
        .filter(CartItem.cart_id == cart.id)
        .scalar()
    )

    db.commit()

    return {
        "message": "Item removed successfully",
        "grand_total": cart.grand_total,
    }


@router.delete("/clear")
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _reject_admin_cart(current_user)

    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id)
        .delete(synchronize_session=False)
    )

    cart.grand_total = Decimal("0.00")

    db.commit()

    return {
        "message": "Cart cleared successfully",
        "grand_total": cart.grand_total,
    }


@router.patch("/item/{cart_item_id}/quantity")
def update_cart_item_quantity(
    cart_item_id: UUID,
    data: UpdateQuantity,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _reject_admin_cart(current_user)

    if data.quantity < 1:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0",
        )

    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()

    if not cart:
        raise HTTPException(
            status_code=404,
            detail="Cart not found",
        )

    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.id == cart_item_id,
            CartItem.cart_id == cart.id,
        )
        .first()
    )

    if not cart_item:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found",
        )

    variant = cart_item.variant

    if not variant:
        raise HTTPException(
            status_code=404,
            detail="Variant not found",
        )

    if data.quantity > variant.stock:
        raise HTTPException(
            status_code=400,
            detail=f"Only {variant.stock} units available",
        )

    cart_item.quantity = data.quantity
    cart_item.item_total = Decimal(str(cart_item.final_price)) * data.quantity

    db.flush()

    cart.grand_total = (
        db.query(
            func.coalesce(
                func.sum(CartItem.item_total),
                Decimal("0.00"),
            )
        )
        .filter(CartItem.cart_id == cart.id)
        .scalar()
    )

    db.commit()
    db.refresh(cart_item)

    return {
        "message": "Quantity updated successfully",
        "cart_item_id": cart_item.id,
        "quantity": cart_item.quantity,
        "item_total": cart_item.item_total,
        "grand_total": cart.grand_total,
    }
