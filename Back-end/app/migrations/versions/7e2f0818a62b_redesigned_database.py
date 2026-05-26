"""Redesigned Database — integer PKs to UUID with FK preservation

Revision ID: 7e2f0818a62b
Revises: a1b2c3d4e5f6
Create Date: 2026-05-26 16:13:04.236414

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "7e2f0818a62b"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

UUID = postgresql.UUID(as_uuid=True)

# (table, pk column) in dependency order — parents before children
PK_TABLES = [
    "users",
    "categories",
    "products",
    "product_variants",
    "product_configs",
    "product_static_configs",
    "product_config_options",
    "product_images",
    "cart",
    "orders",
    "cart_items",
    "order_items",
]

# (table, fk_column, referenced_table)
FK_COLUMNS = [
    ("products", "category_id", "categories"),
    ("product_variants", "product_id", "products"),
    ("product_configs", "product_id", "products"),
    ("product_static_configs", "product_id", "products"),
    ("product_config_options", "config_id", "product_configs"),
    ("product_images", "variant_id", "product_variants"),
    ("cart", "user_id", "users"),
    ("orders", "user_id", "users"),
    ("cart_items", "cart_id", "cart"),
    ("cart_items", "product_id", "products"),
    ("cart_items", "variant_id", "product_variants"),
    ("order_items", "order_id", "orders"),
    ("order_items", "product_id", "products"),
    ("order_items", "variant_id", "product_variants"),
]


def _drop_all_fks() -> None:
    op.execute(
        """
        DO $$
        DECLARE r RECORD;
        BEGIN
            FOR r IN (
                SELECT c.conrelid::regclass::text AS tbl, c.conname
                FROM pg_constraint c
                JOIN pg_namespace n ON n.oid = c.connamespace
                WHERE c.contype = 'f' AND n.nspname = 'public'
            ) LOOP
                EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
            END LOOP;
        END $$;
        """
    )


def _convert_pk(table: str) -> None:
    map_table = f"_uuid_map_{table}"
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
    op.add_column(table, sa.Column("id_uuid", UUID, nullable=True))
    op.execute(f"UPDATE {table} SET id_uuid = gen_random_uuid()")
    op.execute(
        f"""
        CREATE TABLE {map_table} (
            old_id INTEGER PRIMARY KEY,
            new_id UUID NOT NULL
        )
        """
    )
    op.execute(
        f"INSERT INTO {map_table} (old_id, new_id) SELECT id, id_uuid FROM {table}"
    )
    op.drop_column(table, "id")
    op.alter_column(table, "id_uuid", new_column_name="id", nullable=False)
    op.create_primary_key(f"{table}_pkey", table, ["id"])


def _convert_fk(table: str, column: str, ref_table: str) -> None:
    map_table = f"_uuid_map_{ref_table}"
    op.add_column(table, sa.Column(f"{column}_uuid", UUID, nullable=True))
    op.execute(
        f"""
        UPDATE {table} t
        SET {column}_uuid = m.new_id
        FROM {map_table} m
        WHERE t.{column} = m.old_id
        """
    )
    op.drop_column(table, column)
    op.alter_column(table, f"{column}_uuid", new_column_name=column)


def _drop_map_tables() -> None:
    for table in PK_TABLES:
        op.execute(f"DROP TABLE IF EXISTS _uuid_map_{table}")


def _recreate_fks() -> None:
    fk_defs = [
        ("products", "category_id", "categories", "id", "SET NULL"),
        ("product_variants", "product_id", "products", "id", "CASCADE"),
        ("product_configs", "product_id", "products", "id", "CASCADE"),
        ("product_static_configs", "product_id", "products", "id", "CASCADE"),
        ("product_config_options", "config_id", "product_configs", "id", "CASCADE"),
        ("product_images", "variant_id", "product_variants", "id", "CASCADE"),
        ("cart", "user_id", "users", "id", "CASCADE"),
        ("orders", "user_id", "users", "id", "CASCADE"),
        ("cart_items", "cart_id", "cart", "id", "CASCADE"),
        ("cart_items", "product_id", "products", "id", "CASCADE"),
        ("cart_items", "variant_id", "product_variants", "id", "SET NULL"),
        ("order_items", "order_id", "orders", "id", "CASCADE"),
        ("order_items", "product_id", "products", "id", "SET NULL"),
        ("order_items", "variant_id", "product_variants", "id", "SET NULL"),
    ]
    for tbl, col, ref_tbl, ref_col, ondelete in fk_defs:
        op.create_foreign_key(
            f"{tbl}_{col}_fkey",
            tbl,
            ref_tbl,
            [col],
            [ref_col],
            ondelete=ondelete,
        )


def upgrade() -> None:
    _drop_all_fks()

    for table in PK_TABLES:
        _convert_pk(table)

    for table, column, ref_table in FK_COLUMNS:
        _convert_fk(table, column, ref_table)

    _drop_map_tables()
    _recreate_fks()

    # Integer PK indexes from init migration are optional; drop if present
    for table, index in [
        ("users", "ix_users_id"),
        ("categories", "ix_categories_id"),
        ("cart", "ix_cart_id"),
        ("cart_items", "ix_cart_items_id"),
        ("orders", "ix_orders_id"),
        ("order_items", "ix_order_items_id"),
    ]:
        op.execute(f'DROP INDEX IF EXISTS "{index}"')

    # product_configs.type was touched by autogenerate — ensure nullable matches model
    op.alter_column(
        "product_configs",
        "type",
        existing_type=postgresql.ENUM("size", "color", "custom", name="configtype"),
        nullable=True,
        existing_server_default=sa.text("'custom'::configtype"),
    )


def downgrade() -> None:
    raise NotImplementedError(
        "Downgrade from UUID to integer is not supported. Restore from backup if needed."
    )
