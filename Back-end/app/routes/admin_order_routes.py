from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database.db import get_db
from model.db_models import Order, OrderItem
from schemas.order_schema import OrderOut, UpdateOrderStatus, OrderStatus
from utils.helping_funcs import admin_required

router = APIRouter()


@router.get("/", response_model=list[OrderOut])
def get_all_orders(
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.items).joinedload(OrderItem.variant),
        )
        .order_by(Order.created_at.desc())
        .all()
    )

    return orders


@router.put("/{order_id}", response_model=OrderOut)
def update_order_status(
    order_id: UUID,
    data: UpdateOrderStatus,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    order = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.variant),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    current_status = str(order.status)

    if current_status == "delivered":
        raise HTTPException(
            status_code=400,
            detail="Delivered order cannot be modified",
        )

    if data.status == OrderStatus.cancelled and current_status != "cancelled":
        for item in order.items:
            if item.variant:
                item.variant.stock += item.quantity

    order.status = data.status

    db.commit()
    db.refresh(order)

    return order
