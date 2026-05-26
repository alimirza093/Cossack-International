"""flexible product system: configs, images, cart/order snapshots

Revision ID: a1b2c3d4e5f6
Revises: 0e9307fb3296
Create Date: 2026-05-26 12:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "0e9307fb3296"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

config_type_enum = sa.Enum("size", "color", "custom", name="configtype")


def upgrade() -> None:
    config_type_enum.create(op.get_bind(), checkfirst=True)

    op.alter_column("products", "price", new_column_name="base_price")
    op.add_column("products", sa.Column("base_image", sa.Text(), nullable=True))

    op.add_column(
        "product_configs",
        sa.Column(
            "type",
            config_type_enum,
            nullable=False,
            server_default="custom",
        ),
    )
    op.add_column(
        "product_config_options",
        sa.Column(
            "price_modifier",
            sa.Numeric(precision=10, scale=2),
            nullable=True,
            server_default="0",
        ),
    )

    op.create_table(
        "product_static_configs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=True),
        sa.Column("key", sa.String(length=100), nullable=False),
        sa.Column("value", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("variant_id", sa.Integer(), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column("is_primary", sa.Boolean(), nullable=True, server_default="false"),
        sa.ForeignKeyConstraint(
            ["variant_id"], ["product_variants.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Migrate single variant image_url into product_images before dropping column
    conn = op.get_bind()
    rows = conn.execute(
        sa.text(
            "SELECT id, image_url FROM product_variants WHERE image_url IS NOT NULL"
        )
    ).fetchall()
    for row in rows:
        conn.execute(
            sa.text(
                "INSERT INTO product_images (variant_id, image_url, is_primary) "
                "VALUES (:vid, :url, true)"
            ),
            {"vid": row.id, "url": row.image_url},
        )

    op.drop_column("product_variants", "image_url")

    op.add_column(
        "cart_items",
        sa.Column("variant_id", sa.Integer(), nullable=True),
    )
    op.add_column(
        "cart_items",
        sa.Column("selected_options", sa.JSON(), nullable=True),
    )
    op.add_column(
        "cart_items",
        sa.Column("final_price", sa.Numeric(precision=10, scale=2), nullable=True),
    )
    op.create_foreign_key(
        "cart_items_variant_id_fkey",
        "cart_items",
        "product_variants",
        ["variant_id"],
        ["id"],
        ondelete="SET NULL",
    )
    conn.execute(
        sa.text(
            "UPDATE cart_items ci SET final_price = p.base_price "
            "FROM products p WHERE ci.product_id = p.id AND ci.final_price IS NULL"
        )
    )
    op.alter_column("cart_items", "final_price", nullable=False)

    op.add_column(
        "order_items",
        sa.Column("variant_id", sa.Integer(), nullable=True),
    )
    op.add_column(
        "order_items",
        sa.Column("selected_options", sa.JSON(), nullable=True),
    )
    op.add_column(
        "order_items",
        sa.Column("final_price", sa.Numeric(precision=10, scale=2), nullable=True),
    )
    conn.execute(
        sa.text("UPDATE order_items SET final_price = price WHERE final_price IS NULL")
    )
    op.alter_column("order_items", "final_price", nullable=False)
    op.drop_column("order_items", "price")
    op.create_foreign_key(
        "order_items_variant_id_fkey",
        "order_items",
        "product_variants",
        ["variant_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("order_items_variant_id_fkey", "order_items", type_="foreignkey")
    op.add_column(
        "order_items",
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=True),
    )
    op.execute("UPDATE order_items SET price = final_price")
    op.alter_column("order_items", "price", nullable=False)
    op.drop_column("order_items", "final_price")
    op.drop_column("order_items", "selected_options")
    op.drop_column("order_items", "variant_id")

    op.drop_constraint("cart_items_variant_id_fkey", "cart_items", type_="foreignkey")
    op.drop_column("cart_items", "final_price")
    op.drop_column("cart_items", "selected_options")
    op.drop_column("cart_items", "variant_id")

    op.add_column(
        "product_variants",
        sa.Column("image_url", sa.Text(), nullable=True),
    )
    op.drop_table("product_images")
    op.drop_table("product_static_configs")
    op.drop_column("product_config_options", "price_modifier")
    op.drop_column("product_configs", "type")
    op.drop_column("products", "base_image")
    op.alter_column("products", "base_price", new_column_name="price")
    config_type_enum.drop(op.get_bind(), checkfirst=True)
