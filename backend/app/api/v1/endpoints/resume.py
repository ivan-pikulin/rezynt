from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, status, File, UploadFile

from app.api.deps import VerifiedUser, AsyncDB, APIKeyVerified
from app.database.crud.crud_resume import resume_manager
from app.database.crud.crud_template import template_crud
from app.schemas.resume import (
    ResumeCreate, ResumeUpdate,
    ResumePersonalInfoUpdate, ResumeContactCreate,
    ResumeExperienceCreate, ResumeEducationCreate,
    OpenAIResumeUpdate, AIResumeUpdate
)
from app.services.platform_service import PlatformService
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[Dict[str, Any]])
async def get_resumes(
    db: AsyncDB,
    current_user: VerifiedUser,
) -> List[Dict[str, Any]]:
    """
    Get all resumes for the current user.
    Only available for users with verified email.
    """
    resumes = await resume_manager.get_all_resumes(db, user_id=current_user.id)
    return [resume.to_json() for resume in resumes]


@router.post("/", response_model=Dict[str, Any])
async def create_resume(
    *,
    db: AsyncDB,
    resume_in: ResumeCreate,
    current_user: VerifiedUser,
) -> Dict[str, Any]:
    """
    Create a new resume for the current user.
    Only available for users with verified email.
    """
    # Check if template exists
    if resume_in.template_id:
        template = await template_crud.get(db, id=resume_in.template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
    
    resume = await resume_manager.create_resume(db, obj_in=resume_in, user_id=current_user.id)
    return resume.to_json()


@router.get("/{resume_id}", response_model=Dict[str, Any])
async def get_resume(
    *,
    db: AsyncDB,
    resume_id: int,
    current_user: VerifiedUser,
) -> Dict[str, Any]:
    """
    Get a specific resume by ID.
    Only available for users with verified email.
    """
    resume = await resume_manager.get_resume(db, user_id=current_user.id, resume_id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    return resume.to_json()


@router.put("/{resume_id}", response_model=Dict[str, Any])
async def update_resume(
    *,
    db: AsyncDB,
    resume_id: int,
    resume_in: ResumeUpdate,
    current_user: VerifiedUser,
) -> Dict[str, Any]:
    """
    Update a resume.
    Only available for users with verified email.
    """
    resume = await resume_manager.get_resume(db, user_id=current_user.id, resume_id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    # Update the resume
    updated_resume = await resume_manager.update_resume(db, resume_id=resume_id, resume_update=resume_in)
    return updated_resume.to_json()


@router.post("/upload", response_model=Dict[str, Any])
async def upload_resume(
    *,
    db: AsyncDB,
    file: UploadFile = File(...),
    current_user: VerifiedUser,
) -> Dict[str, Any]:
    """
    Upload a resume file.
    Only available for users with verified email.
    """
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.doc', '.docx')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOC, and DOCX files are allowed"
        )
    
    # Create platform service instance
    platform_service = PlatformService(
        app_key=settings.PLATFORM_APP_KEY,
        app_url=settings.PLATFORM_APP_URL,
        timeout=settings.PLATFORM_TIMEOUT
    )
    
    try:
        # Upload file to platform
        file_content = await file.read()
        upload_response = await platform_service.upload_file(file_content, file.filename)
        
        # Create resume from uploaded file
        resume_create = ResumeCreate(
            title=f"Resume from {file.filename}",
            template_id=1,  # Default template
            professional_summary=""
        )
        
        resume = await resume_manager.create_resume(db, obj_in=resume_create, user_id=current_user.id)
        
        return {
            "id": resume.id,
            "file_id": upload_response.get("file_id"),
            "message": "File uploaded and resume created successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )


@router.put("/{resume_id}/template/slug/{slug}", response_model=Dict[str, Any])
async def assign_template(
    *,
    db: AsyncDB,
    resume_id: int,
    slug: str,
    current_user: VerifiedUser,
) -> Dict[str, Any]:
    """
    Assign a specific template to a resume by slug.
    Only available for users with verified email.
    """
    # Check if template exists by slug
    template = await template_crud.get_by_slug(db, slug=slug)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Check if resume exists and belongs to user
    resume = await resume_manager.get_resume(db, user_id=current_user.id, resume_id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    # Update resume with new template
    resume_update = ResumeUpdate(template_id=template.id)
    await resume_manager.update_resume(db, resume_id=resume_id, resume_update=resume_update)
    
    return {
        "status": "success"
    }


@router.post("/{resume_id}/ai-update", response_model=Dict[str, Any], tags=["ai"])
async def update_resume_with_ai(
    *,
    db: AsyncDB,
    resume_id: int,
    ai_update: AIResumeUpdate,
    _: APIKeyVerified,
) -> Dict[str, Any]:
    """
    Update resume with AI-generated content.
    All fields are optional - only passed fields are updated.
    For lists (skills, experience, education) items are added to existing ones.
    Requires valid API key for authorization.
    """
    # Get the resume
    resume = await resume_manager.get_resume(db, user_id=None, resume_id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    updated_fields = {
        "personal_info": False,
        "professional_summary": False,
        "skills_added": 0,
        "experience_added": 0,
        "education_added": 0,
        "contacts_added": 0
    }
    
    # Update professional summary if provided
    if ai_update.professional_summary:
        resume_update = ResumeUpdate(professional_summary=ai_update.professional_summary)
        await resume_manager.update_resume(db, resume_id=resume_id, resume_update=resume_update)
        updated_fields["professional_summary"] = True
    
    # Update personal info if provided
    if ai_update.first_name or ai_update.last_name or ai_update.location:
        personal_info_update = ResumePersonalInfoUpdate(
            first_name=ai_update.first_name,
            last_name=ai_update.last_name,
            location=ai_update.location
        )
        await resume_manager.update_personal_info(db, resume_id=resume_id, personal_info=personal_info_update)
        updated_fields["personal_info"] = True
    
    # Add new contacts if provided
    if ai_update.contacts:
        for contact_value in ai_update.contacts:
            await resume_manager.add_contact(db, resume_id=resume_id, contact_value=contact_value)
        updated_fields["contacts_added"] = len(ai_update.contacts)
    
    # Add new skills if provided
    if ai_update.skills:
        for skill_name in ai_update.skills:
            await resume_manager.add_skill(db, resume_id=resume_id, skill_name=skill_name)
        updated_fields["skills_added"] = len(ai_update.skills)
    
    # Add new experience if provided
    if ai_update.experience:
        for exp_data in ai_update.experience:
            from datetime import datetime
            start_date = datetime.strptime(exp_data["start_date"], "%Y-%m-%dT%H:%M:%S").date()
            end_date = None
            if exp_data.get("end_date"):
                end_date = datetime.strptime(exp_data["end_date"], "%Y-%m-%dT%H:%M:%S").date()
            
            experience_create = ResumeExperienceCreate(
                job_title=exp_data["job_title"],
                company=exp_data["company"],
                location=exp_data["location"],
                start_date=start_date,
                end_date=end_date,
                responsibilities=exp_data.get("responsibilities", [])
            )
            await resume_manager.add_experience(db, resume_id=resume_id, experience_data=experience_create)
        updated_fields["experience_added"] = len(ai_update.experience)
    
    # Add new education if provided
    if ai_update.education:
        for edu_data in ai_update.education:
            graduation_date = None
            if edu_data.get("graduation_date"):
                from datetime import datetime
                graduation_date = datetime.strptime(edu_data["graduation_date"], "%Y-%m-%dT%H:%M:%S").date()
            
            education_create = ResumeEducationCreate(
                degree=edu_data["degree"],
                institution=edu_data["institution"],
                location=edu_data["location"],
                graduation_date=graduation_date
            )
            await resume_manager.add_education(db, resume_id=resume_id, education_data=education_create)
        updated_fields["education_added"] = len(ai_update.education)
    
    # Get updated resume
    updated_resume = await resume_manager.get_resume(db, user_id=None, resume_id=resume_id)
    
    return {
        "resume_id": resume_id,
        "message": "Resume updated successfully with AI content",
        "updated_fields": updated_fields,
        "resume": updated_resume.to_json()
    }
