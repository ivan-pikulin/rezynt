from typing import Any, Dict
from datetime import datetime

from app.api.deps import APIKeyVerified, AsyncDB
from app.database.crud.crud_resume import resume_manager
from app.schemas.resume import (AIResumeUpdate, ResumeUpdate, ResumePartialUpdate, 
                               ResumeExperienceCreate, ResumeEducationCreate, UnifiedResumeExperience,
                               ResumeExperienceUpdate, ResumeEducationUpdate,
                               ResumePatchRequest, ExperienceCreateRequest, ExperienceUpdateRequest,
                               EducationCreateRequest, EducationUpdateRequest)
from fastapi import APIRouter, HTTPException, status

router = APIRouter()


@router.patch("/resume/{resume_id}", response_model=Dict[str, Any], tags=["resume"])
async def patch_resume(
    *,
    db: AsyncDB,
    resume_id: int,
    patch_data: ResumePatchRequest,
    _: APIKeyVerified,
) -> Dict[str, Any]:
    """
    Patch resume fields: first_name, last_name, location, professional_summary, skills, contacts.
    Requires valid API key for authorization.
    """
    # Get the resume
    resume = await resume_manager.get_resume_by_id(db, resume_id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Update basic resume fields
    basic_update_data = {}
    if patch_data.professional_summary is not None:
        basic_update_data['professional_summary'] = patch_data.professional_summary
    
    if basic_update_data:
        basic_update = ResumeUpdate(**basic_update_data)
        await resume_manager.update_resume(db, resume_id=resume_id, resume_update=basic_update)
    
    # Update personal info
    personal_info_data = {}
    if patch_data.first_name is not None:
        personal_info_data['first_name'] = patch_data.first_name
    if patch_data.last_name is not None:
        personal_info_data['last_name'] = patch_data.last_name
    if patch_data.location is not None:
        personal_info_data['location'] = patch_data.location
    
    if personal_info_data:
        personal_info_update = ResumePartialUpdate(**personal_info_data)
        await resume_manager.partial_update_resume(db, resume_id=resume_id, resume_update=personal_info_update)
    
    # Update contacts
    if patch_data.contacts is not None:
        await resume_manager.update_contacts(db, resume_id=resume_id, contacts=patch_data.contacts)
    
    # Update skills
    if patch_data.skills is not None:
        await resume_manager.update_skills(db, resume_id=resume_id, skills=patch_data.skills)
    
    return {
        "resume_id": resume_id,
        "message": "Resume patched successfully"
    }


@router.post("/resume/{resume_id}/experience", response_model=Dict[str, Any], tags=["experience"])
async def create_experience(
    *,
    db: AsyncDB,
    resume_id: int,
    experience_data: ExperienceCreateRequest,
    _: APIKeyVerified,
) -> Dict[str, Any]:
    """
    Create new experience entry for resume.
    Requires valid API key for authorization.
    """
    # Get the resume
    resume = await resume_manager.get_resume_by_id(db, resume_id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Convert to ResumeExperienceCreate
    experience_create = ResumeExperienceCreate(
        job_title=experience_data.job_title,
        company=experience_data.company,
        location=experience_data.location,
        start_date=experience_data.start_date,
        end_date=experience_data.end_date,
        responsibilities=experience_data.responsibilities or []
    )
    
    # Create experience
    new_experience = await resume_manager.add_experience(db, resume_id=resume_id, experience_data=experience_create)
    
    return {
        "resume_id": resume_id,
        "experience_id": new_experience.id,
        "message": "Experience created successfully",
    }


@router.patch("/resume/{resume_id}/experience/{experience_id}", response_model=Dict[str, Any], tags=["experience"])
async def update_experience(
    *,
    db: AsyncDB,
    resume_id: int,
    experience_id: int,
    experience_data: ExperienceUpdateRequest,
    _: APIKeyVerified,
) -> Dict[str, Any]:
    """
    Update existing experience entry for resume.
    Requires valid API key for authorization.
    """
    # Get the resume
    resume = await resume_manager.get_resume_by_id(db, resume_id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Convert to ResumeExperienceUpdate - only include non-None fields
    experience_update_data = {}
    if experience_data.job_title is not None:
        experience_update_data['job_title'] = experience_data.job_title
    if experience_data.company is not None:
        experience_update_data['company'] = experience_data.company
    if experience_data.location is not None:
        experience_update_data['location'] = experience_data.location
    if experience_data.start_date is not None:
        experience_update_data['start_date'] = experience_data.start_date
    if experience_data.end_date is not None:
        experience_update_data['end_date'] = experience_data.end_date
    if experience_data.responsibilities is not None:
        experience_update_data['responsibilities'] = experience_data.responsibilities
    
    experience_update = ResumeExperienceUpdate(**experience_update_data)
    
    # Update experience
    updated_experience = await resume_manager.update_experience(db, resume_id=resume_id, experience_id=experience_id, experience_data=experience_update)
    
    if not updated_experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found or does not belong to this resume"
        )
    
    return {
        "resume_id": resume_id,
        "experience_id": updated_experience.id,
        "message": "Experience updated successfully",
    }


@router.post("/resume/{resume_id}/education", response_model=Dict[str, Any], tags=["education"])
async def create_education(
    *,
    db: AsyncDB,
    resume_id: int,
    education_data: EducationCreateRequest,
    _: APIKeyVerified,
) -> Dict[str, Any]:
    """
    Create new education entry for resume.
    Requires valid API key for authorization.
    """
    # Get the resume
    resume = await resume_manager.get_resume_by_id(db, resume_id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Convert to ResumeEducationCreate
    education_create = ResumeEducationCreate(
        degree=education_data.degree,
        institution=education_data.institution,
        location=education_data.location,
        graduation_date=education_data.graduation_date
    )
    
    # Create education
    new_education = await resume_manager.add_education(db, resume_id=resume_id, education_data=education_create)
    
    return {
        "resume_id": resume_id,
        "education_id": new_education.id,
        "message": "Education created successfully",
    }


@router.patch("/resume/{resume_id}/education/{education_id}", response_model=Dict[str, Any], tags=["education"])
async def update_education(
    *,
    db: AsyncDB,
    resume_id: int,
    education_id: int,
    education_data: EducationUpdateRequest,
    _: APIKeyVerified,
) -> Dict[str, Any]:
    """
    Update existing education entry for resume.
    Requires valid API key for authorization.
    """
    # Get the resume
    resume = await resume_manager.get_resume_by_id(db, resume_id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Convert to ResumeEducationUpdate - only include non-None fields
    education_update_data = {}
    if education_data.degree is not None:
        education_update_data['degree'] = education_data.degree
    if education_data.institution is not None:
        education_update_data['institution'] = education_data.institution
    if education_data.location is not None:
        education_update_data['location'] = education_data.location
    if education_data.graduation_date is not None:
        education_update_data['graduation_date'] = education_data.graduation_date
    
    education_update = ResumeEducationUpdate(**education_update_data)
    
    # Update education
    updated_education = await resume_manager.update_education(db, resume_id=resume_id, education_id=education_id, education_data=education_update)
    
    if not updated_education:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education not found or does not belong to this resume"
        )
    
    return {
        "resume_id": resume_id,
        "education_id": updated_education.id,
        "message": "Education updated successfully",
    }
