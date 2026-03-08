"""Add tracked and yahoo_symbol to assets

Revision ID: 0002
Revises: 0001
Create Date: 2026-03-08
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("assets", sa.Column("yahoo_symbol", sa.String(50), nullable=True))
    op.add_column("assets", sa.Column("tracked", sa.Boolean(), nullable=False, server_default="true"))
    op.create_index("ix_assets_tracked", "assets", ["tracked"])


def downgrade() -> None:
    op.drop_index("ix_assets_tracked", table_name="assets")
    op.drop_column("assets", "tracked")
    op.drop_column("assets", "yahoo_symbol")
