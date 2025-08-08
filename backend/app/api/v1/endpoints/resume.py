from typing import Any, Dict
from uuid import UUID

from fastapi import APIRouter, File, UploadFile, HTTPException, status
from app.api.deps import VerifiedUser, AsyncDB
from app.database.crud.crud_resume import resume_crud
from app.database.crud.crud_template import template_crud
from app.schemas.resume import ResumeUpdate

router = APIRouter()


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Upload resume file and return file ID.
    Only available for users with verified email.
    """
    # TODO: Implement actual file processing and storage
    # For now, return mocked ID as requested
    return {"id": "12345"}


@router.put("/{resume_id}/template/{template_id}")
async def assign_template_to_resume(
    resume_id: UUID,
    template_id: UUID,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Assign a specific template to a resume.
    Only available for users with verified email.
    """
    # Check if template exists
    template = await template_crud.get(db, id=template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Check if resume exists and belongs to current user
    resume = await resume_crud.get_by_user_id_and_id(
        db, user_id=current_user.id, resume_id=resume_id
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    # Update resume with new template
    resume_update = ResumeUpdate(template_id=template_id)
    updated_resume = await resume_crud.update(db, db_obj=resume, obj_in=resume_update)
    
    return {
        "id": str(updated_resume.id),
        "template_id": str(updated_resume.template_id),
        "message": "Template assigned successfully"
    }
