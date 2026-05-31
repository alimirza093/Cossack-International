from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from database.db import get_db
from sqlalchemy import func
from model.db_models import (
    Cart,
    CartItem,
    Order,
    OrderItem,
    Product,
    ProductConfig,
    ProductConfigOption,
    ProductVariant,
)
from auth.jwt_handler import verify_token
from utils.uuid_utils import parse_uuid
from schemas.order_schema import OrderOut, CreateOrderRequest
from decimal import Decimal

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.post("/", response_model=OrderOut, status_code=201)
def create_order(
    data: CreateOrderRequest,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid Token",
        )

    user_id = parse_uuid(payload.get("user_id"))

    if not data.cart_item_ids:
        raise HTTPException(
            status_code=400,
            detail="No cart items selected",
        )

    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items).joinedload(CartItem.variant))
        .filter(Cart.user_id == user_id)
        .first()
    )

    if not cart:
        raise HTTPException(
            status_code=404,
            detail="Cart not found",
        )

    selected_items = (
        db.query(CartItem)
        .options(
            joinedload(CartItem.product),
            joinedload(CartItem.variant),
        )
        .filter(
            CartItem.cart_id == cart.id,
            CartItem.id.in_(data.cart_item_ids),
        )
        .all()
    )

    if len(selected_items) != len(set(data.cart_item_ids)):
        raise HTTPException(
            status_code=404,
            detail="One or more cart items not found",
        )

    order_total = Decimal("0.00")

    for item in selected_items:

        if not item.product:
            raise HTTPException(
                status_code=400,
                detail="Product no longer exists",
            )

        if item.product.is_deleted:
            raise HTTPException(
                status_code=400,
                detail=f"Product '{item.product.name}' is unavailable",
            )

        if not item.variant:
            raise HTTPException(
                status_code=400,
                detail="Variant no longer exists",
            )

        if item.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid quantity",
            )

        if item.quantity > item.variant.stock:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Only {item.variant.stock} units available "
                    f"for {item.variant.color}"
                ),
            )

        order_total += Decimal(item.item_total)

    try:

        order = Order(
            user_id=user_id,
            total_price=order_total,
            status="pending",
        )

        db.add(order)
        db.flush()

        for item in selected_items:

            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                variant_id=item.variant_id,
                selected_options=item.selected_options,
                final_price=item.final_price,
                item_total=item.item_total,
                quantity=item.quantity,
            )

            db.add(order_item)

            item.variant.stock -= item.quantity

        db.query(CartItem).filter(CartItem.id.in_(data.cart_item_ids)).delete(
            synchronize_session=False
        )

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

    except Exception:
        db.rollback()
        raise

    order = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.items).joinedload(OrderItem.variant),
        )
        .filter(Order.id == order.id)
        .first()
    )

    return order


@router.get("/my", response_model=list[OrderOut])
def get_my_orders(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid Token",
        )

    user_id = parse_uuid(payload.get("user_id"))

    orders = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.items).joinedload(OrderItem.variant),
        )
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .all()
    )

    return orders


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: UUID,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid Token",
        )

    user_id = parse_uuid(payload.get("user_id"))

    order = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.items).joinedload(OrderItem.variant),
        )
        .filter(
            Order.id == order_id,
            Order.user_id == user_id,
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    return order
