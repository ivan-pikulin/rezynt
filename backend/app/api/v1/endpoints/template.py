from typing import List

from fastapi import APIRouter, HTTPException, status
from app.api.deps import VerifiedUser, AsyncDB
from app.database.crud.crud_template import template_crud
from app.schemas.template import Template, TemplateCreate, TemplateUpdate

router = APIRouter()


@router.get("/", response_model=List[Template])
async def get_templates(
    db: AsyncDB = None
) -> List[Template]:
    """
    Get all templates.
    """
    templates = await template_crud.get_multi(db)
    return templates


@router.get("/premium", response_model=List[Template])
async def get_premium_templates(
    db: AsyncDB = None
) -> List[Template]:
    """
    Get all premium templates.
    """
    templates = await template_crud.get_premium_templates(db)
    return templates


@router.get("/free", response_model=List[Template])
async def get_free_templates(
    db: AsyncDB = None
) -> List[Template]:
    """
    Get all free templates.
    """
    templates = await template_crud.get_free_templates(db)
    return templates


@router.get("/{template_id}", response_model=Template)
async def get_template(
    template_id: int,
    db: AsyncDB = None
) -> Template:
    """
    Get a specific template by ID.
    """
    template = await template_crud.get(db, id=template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return template


@router.get("/slug/{slug}", response_model=Template)
async def get_template_by_slug(
    slug: str,
    db: AsyncDB = None
) -> Template:
    """
    Get a specific template by slug.
    """
    template = await template_crud.get_by_slug(db, slug=slug)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return template


@router.post("/", response_model=Template)
async def create_template(
    template_create: TemplateCreate,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Template:
    """
    Create a new template.
    Only available for users with verified email.
    """
    # Check if template with same slug already exists
    existing_template = await template_crud.get_by_slug(db, slug=template_create.slug)
    if existing_template:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Template with this slug already exists"
        )
    
    template = await template_crud.create(db, obj_in=template_create)
    return template


@router.put("/{template_id}", response_model=Template)
async def update_template(
    template_id: int,
    template_update: TemplateUpdate,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Template:
    """
    Update a template.
    Only available for users with verified email.
    """
    template = await template_crud.get(db, id=template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Check if slug is being updated and if it conflicts with existing template
    if template_update.slug and template_update.slug != template.slug:
        existing_template = await template_crud.get_by_slug(db, slug=template_update.slug)
        if existing_template:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Template with this slug already exists"
            )
    
    updated_template = await template_crud.update(db, db_obj=template, obj_in=template_update)
    return updated_template


@router.delete("/{template_id}")
async def delete_template(
    template_id: int,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> dict:
    """
    Delete a template.
    Only available for users with verified email.
    """
    template = await template_crud.get(db, id=template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    await template_crud.remove(db, id=template_id)
    
    return {
        "id": str(template_id),
        "message": "Template deleted successfully"
    }
