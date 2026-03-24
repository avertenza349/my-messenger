"""add avatar_url to users

Revision ID: 1f207299aa83
Revises: 
Create Date: 2026-03-19 20:17:10.048093

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1f207299aa83'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column("users", sa.Column("avatar_url", sa.String(), nullable=True))


def downgrade():
    op.drop_column("users", "avatar_url")
