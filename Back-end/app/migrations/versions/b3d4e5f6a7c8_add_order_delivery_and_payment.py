"""add order delivery_address and payment_method

Revision ID: b3d4e5f6a7c8
Revises: f8a2c1d4e6b7
Create Date: 2026-06-03 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b3d4e5f6a7c8"
down_revision: Union[str, Sequence[str], None] = "f8a2c1d4e6b7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column("delivery_address", sa.Text(), nullable=False, server_default=""),
    )
    op.add_column(
        "orders",
        sa.Column(
            "payment_method",
            sa.String(length=50),
            nullable=False,
            server_default="cash_on_delivery",
        ),
    )
    op.alter_column("orders", "delivery_address", server_default=None)


def downgrade() -> None:
    op.drop_column("orders", "payment_method")
    op.drop_column("orders", "delivery_address")
