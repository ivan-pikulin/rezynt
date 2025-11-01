"""Add resume_data JSONB to users and drop resume tables

Revision ID: 001_resume_jsonb
Revises: 
Create Date: 2025-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_resume_jsonb'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add resume_data column to users table
    op.add_column('users', sa.Column('resume_data', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False))
    
    # Drop all resume-related tables if they exist
    op.drop_table('resume_exports', if_exists=True)
    op.drop_table('resume_education', if_exists=True)
    op.drop_table('resume_experience', if_exists=True)
    op.drop_table('resume_skills', if_exists=True)
    op.drop_table('resume_contacts', if_exists=True)
    op.drop_table('resume_personal_info', if_exists=True)
    op.drop_table('resumes', if_exists=True)


def downgrade() -> None:
    # This migration is not reversible as it deletes data
    # If needed, backup data before running upgrade
    raise NotImplementedError("This migration cannot be reversed as it deletes resume tables")

