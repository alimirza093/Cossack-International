"""add is_deleted to category

Revision ID: f8a2c1d4e6b7
Revises: 74370eb8fa18
Create Date: 2026-06-03 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f8a2c1d4e6b7"
down_revision: Union[str, Sequence[str], None] = "74370eb8fa18"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "categories",
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )


def downgrade() -> None:
    op.drop_column("categories", "is_deleted")
