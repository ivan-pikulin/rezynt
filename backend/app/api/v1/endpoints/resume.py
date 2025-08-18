from typing import Any, Dict, List
from uuid import UUID

from app.api.deps import AsyncDB, VerifiedUser
from app.database.crud.crud_resume import resume_crud, resume_manager
from app.database.crud.crud_template import template_crud
from app.schemas.resume import (ResumeCreate, ResumeEducationCreate,
                                ResumeExperienceCreate, ResumeExportCreate,
                                ResumeInDB, ResumePartialUpdate,
                                ResumePersonalInfoUpdate, ResumeSkillCreate,
                                ResumeUpdate, OpenAIResumeUpdate)
from fastapi import APIRouter, File, HTTPException, UploadFile, status

router = APIRouter()


@router.get("/", response_model=List[ResumeInDB])
async def get_user_resumes(
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> List[ResumeInDB]:
    """
    Get all resumes for the current user.
    Only available for users with verified email.
    """
    resumes = await resume_crud.get_by_user_id(db, user_id=current_user.id)
    return resumes


@router.post("/", response_model=ResumeInDB)
async def create_resume(
    resume_create: ResumeCreate,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> ResumeInDB:
    """
    Create a new resume for the current user.
    Only available for users with verified email.
    """
    # Check if template exists
    template = await template_crud.get(db, id=resume_create.template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Create resume with user_id
    resume = await resume_crud.create(db, obj_in=resume_create, user_id=current_user.id)
    
    return resume


@router.get("/{resume_id}", response_model=ResumeInDB)
async def get_resume(
    resume_id: UUID,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> ResumeInDB:
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


@router.patch("/{resume_id}", response_model=ResumeInDB)
async def partial_update_resume(
    resume_id: UUID,
    resume_update: ResumePartialUpdate,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> ResumeInDB:
    """
    Partially update a resume with any combination of fields.
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
    
    # Update main resume fields
    main_update_data = {}
    if resume_update.title is not None:
        main_update_data["title"] = resume_update.title
    if resume_update.template_id is not None:
        main_update_data["template_id"] = resume_update.template_id
    if resume_update.professional_summary is not None:
        main_update_data["professional_summary"] = resume_update.professional_summary
    if resume_update.conversation_id is not None:
        main_update_data["conversation_id"] = resume_update.conversation_id
    
    if main_update_data:
        main_update = ResumeUpdate(**main_update_data)
        resume = await resume_crud.update(db, db_obj=resume, obj_in=main_update)
    
    # Update personal info if provided
    if resume_update.personal_info:
        await resume_manager.update_personal_info(
            db, resume_id=resume_id, personal_info=resume_update.personal_info
        )
    
    # Return updated resume
    return await resume_crud.get_by_user_id_and_id(db, user_id=current_user.id, resume_id=resume_id)


@router.put("/{resume_id}", response_model=ResumeInDB)
async def update_resume(
    resume_id: UUID,
    resume_update: ResumeUpdate,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> ResumeInDB:
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


# Personal Info endpoints
@router.patch("/{resume_id}/personal-info")
async def update_personal_info(
    resume_id: UUID,
    personal_info: ResumePersonalInfoUpdate,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Update personal information for a resume.
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
    
    updated_info = await resume_manager.update_personal_info(
        db, resume_id=resume_id, personal_info=personal_info
    )
    
    return {
        "resume_id": str(resume_id),
        "personal_info": updated_info,
        "message": "Personal information updated successfully"
    }


# Skills endpoints
@router.post("/{resume_id}/skills")
async def add_skill(
    resume_id: UUID,
    skill_data: ResumeSkillCreate,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Add a skill to a resume.
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
    
    skill = await resume_manager.add_skill(db, resume_id=resume_id, skill_name=skill_data.name)
    
    return {
        "resume_id": str(resume_id),
        "skill": skill,
        "message": "Skill added successfully"
    }


@router.delete("/{resume_id}/skills/{skill_id}")
async def remove_skill(
    resume_id: UUID,
    skill_id: UUID,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Remove a skill from a resume.
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
    
    success = await resume_manager.remove_skill(db, resume_id=resume_id, skill_id=skill_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found or does not belong to this resume"
        )
    
    return {
        "resume_id": str(resume_id),
        "skill_id": str(skill_id),
        "message": "Skill removed successfully"
    }


@router.put("/{resume_id}/skills/order")
async def update_skill_order(
    resume_id: UUID,
    skill_ids: List[UUID],
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Update the order of skills in a resume.
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
    
    try:
        await resume_manager.update_skill_order(db, resume_id=resume_id, skill_ids=skill_ids)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    return {
        "resume_id": str(resume_id),
        "skill_ids": [str(skill_id) for skill_id in skill_ids],
        "message": "Skill order updated successfully"
    }


# Experience endpoints
@router.post("/{resume_id}/experience")
async def add_experience(
    resume_id: UUID,
    experience_data: ResumeExperienceCreate,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Add experience to a resume.
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
    
    experience = await resume_manager.add_experience(db, resume_id=resume_id, experience_data=experience_data)
    
    return {
        "resume_id": str(resume_id),
        "experience": experience,
        "message": "Experience added successfully"
    }


@router.put("/{resume_id}/experience/{experience_id}")
async def update_experience(
    resume_id: UUID,
    experience_id: UUID,
    experience_data: Dict[str, Any],
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Update experience in a resume.
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
    
    from app.schemas.resume import ResumeExperienceUpdate
    update_data = ResumeExperienceUpdate(**experience_data)
    updated_experience = await resume_manager.update_experience(
        db, resume_id=resume_id, experience_id=experience_id, experience_data=update_data
    )
    
    if not updated_experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found or does not belong to this resume"
        )
    
    return {
        "resume_id": str(resume_id),
        "experience": updated_experience,
        "message": "Experience updated successfully"
    }


@router.delete("/{resume_id}/experience/{experience_id}")
async def remove_experience(
    resume_id: UUID,
    experience_id: UUID,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Remove experience from a resume.
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
    
    success = await resume_manager.remove_experience(db, resume_id=resume_id, experience_id=experience_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found or does not belong to this resume"
        )
    
    return {
        "resume_id": str(resume_id),
        "experience_id": str(experience_id),
        "message": "Experience removed successfully"
    }


@router.put("/{resume_id}/experience/order")
async def update_experience_order(
    resume_id: UUID,
    experience_ids: List[UUID],
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Update the order of experience entries in a resume.
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
    
    try:
        await resume_manager.update_experience_order(db, resume_id=resume_id, experience_ids=experience_ids)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    return {
        "resume_id": str(resume_id),
        "experience_ids": [str(exp_id) for exp_id in experience_ids],
        "message": "Experience order updated successfully"
    }


# Education endpoints
@router.post("/{resume_id}/education")
async def add_education(
    resume_id: UUID,
    education_data: ResumeEducationCreate,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Add education to a resume.
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
    
    education = await resume_manager.add_education(db, resume_id=resume_id, education_data=education_data)
    
    return {
        "resume_id": str(resume_id),
        "education": education,
        "message": "Education added successfully"
    }


@router.put("/{resume_id}/education/{education_id}")
async def update_education(
    resume_id: UUID,
    education_id: UUID,
    education_data: Dict[str, Any],
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Update education in a resume.
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
    
    from app.schemas.resume import ResumeEducationUpdate
    update_data = ResumeEducationUpdate(**education_data)
    updated_education = await resume_manager.update_education(
        db, resume_id=resume_id, education_id=education_id, education_data=update_data
    )
    
    if not updated_education:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education not found or does not belong to this resume"
        )
    
    return {
        "resume_id": str(resume_id),
        "education": updated_education,
        "message": "Education updated successfully"
    }


@router.delete("/{resume_id}/education/{education_id}")
async def remove_education(
    resume_id: UUID,
    education_id: UUID,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Remove education from a resume.
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
    
    success = await resume_manager.remove_education(db, resume_id=resume_id, education_id=education_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education not found or does not belong to this resume"
        )
    
    return {
        "resume_id": str(resume_id),
        "education_id": str(education_id),
        "message": "Education removed successfully"
    }


@router.put("/{resume_id}/education/order")
async def update_education_order(
    resume_id: UUID,
    education_ids: List[UUID],
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Update the order of education entries in a resume.
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
    
    try:
        await resume_manager.update_education_order(db, resume_id=resume_id, education_ids=education_ids)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    return {
        "resume_id": str(resume_id),
        "education_ids": [str(edu_id) for edu_id in education_ids],
        "message": "Education order updated successfully"
    }


# Export endpoints
@router.post("/{resume_id}/exports")
async def add_export_record(
    resume_id: UUID,
    export_data: ResumeExportCreate,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Add an export record for a resume.
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
    
    export_record = await resume_manager.add_export_record(
        db, 
        resume_id=resume_id, 
        export_format=export_data.export_format,
        file_size=export_data.file_size,
        export_settings=export_data.export_settings
    )
    
    return {
        "resume_id": str(resume_id),
        "export_record": export_record,
        "message": "Export record added successfully"
    }


@router.get("/{resume_id}/exports")
async def get_export_history(
    resume_id: UUID,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Get export history for a resume.
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
    
    export_history = await resume_manager.get_export_history(db, resume_id=resume_id)
    
    return {
        "resume_id": str(resume_id),
        "export_history": export_history
    }


# OpenAI Structured Output endpoint
@router.post("/{resume_id}/ai-update")
async def update_resume_with_ai(
    resume_id: UUID,
    ai_update: OpenAIResumeUpdate,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Update resume with AI-generated content using OpenAI structured output.
    All fields are optional - only provided fields will be updated/added.
    Only available for users with verified email.
    """
    # Check if resume exists and belongs to current user
    resume = await resume_crud.get_by_user_id_and_id(
        db, user_id=current_user.id, resume_id=resume_id
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    # Update main resume fields
    main_update_data = {}
    if ai_update.professionalSummary is not None:
        main_update_data["professional_summary"] = ai_update.professionalSummary
    
    if main_update_data:
        main_update = ResumeUpdate(**main_update_data)
        resume = await resume_crud.update(db, db_obj=resume, obj_in=main_update)
    
    # Update personal info if provided
    if ai_update.personalInfo:
        personal_info_update = ResumePersonalInfoUpdate(
            first_name=ai_update.personalInfo.firstName,
            last_name=ai_update.personalInfo.lastName,
            middle_name=ai_update.personalInfo.middleName,
            phone=ai_update.personalInfo.phone,
            email=ai_update.personalInfo.email,
            location=ai_update.personalInfo.location
        )
        await resume_manager.update_personal_info(
            db, resume_id=resume_id, personal_info=personal_info_update
        )
    
    # Add skills if provided
    if ai_update.skills:
        for skill in ai_update.skills:
            await resume_manager.add_skill(db, resume_id=resume_id, skill_name=skill.name)
    
    # Add experience if provided
    if ai_update.experience:
        for exp in ai_update.experience:
            from datetime import datetime
            start_date = datetime.strptime(exp.startDate, "%Y-%m-%d").date()
            end_date = None
            if exp.endDate:
                end_date = datetime.strptime(exp.endDate, "%Y-%m-%d").date()
            
            experience_data = ResumeExperienceCreate(
                job_title=exp.jobTitle,
                company=exp.company,
                location=exp.location,
                start_date=start_date,
                end_date=end_date,
                is_current=exp.isCurrent,
                responsibilities=exp.responsibilities
            )
            await resume_manager.add_experience(db, resume_id=resume_id, experience_data=experience_data)
    
    # Add education if provided
    if ai_update.education:
        for edu in ai_update.education:
            graduation_date = None
            if edu.graduationDate:
                from datetime import datetime
                graduation_date = datetime.strptime(edu.graduationDate, "%Y-%m-%d").date()
            
            education_data = ResumeEducationCreate(
                degree=edu.degree,
                institution=edu.institution,
                location=edu.location,
                graduation_date=graduation_date
            )
            await resume_manager.add_education(db, resume_id=resume_id, education_data=education_data)
    
    # Return updated resume
    updated_resume = await resume_crud.get_by_user_id_and_id(db, user_id=current_user.id, resume_id=resume_id)
    
    return {
        "resume_id": str(resume_id),
        "message": "Resume updated successfully with AI content",
        "updated_fields": {
            "personal_info": ai_update.personalInfo is not None,
            "professional_summary": ai_update.professionalSummary is not None,
            "skills_added": len(ai_update.skills) if ai_update.skills else 0,
            "experience_added": len(ai_update.experience) if ai_update.experience else 0,
            "education_added": len(ai_update.education) if ai_update.education else 0
        },
        "resume": updated_resume
    }


# Legacy endpoints (keeping for backward compatibility)
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
