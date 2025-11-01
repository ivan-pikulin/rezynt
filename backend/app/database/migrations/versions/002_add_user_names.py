"""Add first_name and last_name to users

Revision ID: 002_user_names
Revises: 001_resume_jsonb
Create Date: 2025-11-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_user_names'
down_revision = '001_resume_jsonb'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add first_name and last_name columns to users table
    op.add_column('users', sa.Column('first_name', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('last_name', sa.String(length=100), nullable=True))


def downgrade() -> None:
    # Remove first_name and last_name columns from users table
    op.drop_column('users', 'last_name')
    op.drop_column('users', 'first_name')

