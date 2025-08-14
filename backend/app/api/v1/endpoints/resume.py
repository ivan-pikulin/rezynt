from typing import Any, Dict, List
from uuid import UUID

from fastapi import APIRouter, File, UploadFile, HTTPException, status
from app.api.deps import VerifiedUser, AsyncDB
from app.database.crud.crud_resume import resume_crud
from app.database.crud.crud_template import template_crud
from app.schemas.resume import ResumeUpdate, Resume

router = APIRouter()


@router.get("/", response_model=List[Resume])
async def get_user_resumes(
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> List[Resume]:
    """
    Get all resumes for the current user.
    Only available for users with verified email.
    """
    resumes = await resume_crud.get_by_user_id(db, user_id=current_user.id)
    return resumes


@router.get("/{resume_id}", response_model=Resume)
async def get_resume(
    resume_id: UUID,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Resume:
    """
    Get a specific resume by ID.
    Only available for users with verified email.
    """
    resume = await resume_crud.get_by_user_id_and_id(
        db, user_id=current_user.id, resume_id=resume_id
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    return resume


@router.get("/{resume_id}/section/{section_name}")
async def get_resume_section(
    resume_id: UUID,
    section_name: str,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Get a specific section of a resume.
    Only available for users with verified email.
    """
    resume = await resume_crud.get_by_user_id_and_id(
        db, user_id=current_user.id, resume_id=resume_id
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    if section_name not in resume.content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Section '{section_name}' not found in resume"
        )
    
    return {
        "resume_id": str(resume.id),
        "section_name": section_name,
        "content": resume.content[section_name]
    }


@router.put("/{resume_id}", response_model=Resume)
async def update_resume(
    resume_id: UUID,
    resume_update: ResumeUpdate,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Resume:
    """
    Update a resume completely.
    Only available for users with verified email.
    """
    resume = await resume_crud.get_by_user_id_and_id(
        db, user_id=current_user.id, resume_id=resume_id
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    updated_resume = await resume_crud.update(db, db_obj=resume, obj_in=resume_update)
    return updated_resume


@router.put("/{resume_id}/section/{section_name}")
async def update_resume_section(
    resume_id: UUID,
    section_name: str,
    section_content: Dict[str, Any],
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Update a specific section of a resume.
    Only available for users with verified email.
    """
    resume = await resume_crud.get_by_user_id_and_id(
        db, user_id=current_user.id, resume_id=resume_id
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    # Create a copy of the current content and update the specific section
    updated_content = resume.content.copy()
    updated_content[section_name] = section_content
    
    # Create update object with new content
    resume_update = ResumeUpdate(content=updated_content)
    updated_resume = await resume_crud.update(db, db_obj=resume, obj_in=resume_update)
    
    return {
        "resume_id": str(updated_resume.id),
        "section_name": section_name,
        "content": updated_resume.content[section_name],
        "message": f"Section '{section_name}' updated successfully"
    }


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
