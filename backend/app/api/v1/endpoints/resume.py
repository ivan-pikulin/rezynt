from typing import Any, Dict, List
from uuid import UUID

from app.api.deps import AsyncDB, VerifiedUser
from app.database.crud.crud_resume import resume_crud, resume_manager
from app.database.crud.crud_template import template_crud
from app.schemas.resume import (ResumeCreate, ResumeEducationCreate,
                                ResumeExperienceCreate, ResumeExportCreate,
                                ResumeInDB, ResumePartialUpdate,
                                ResumePersonalInfoUpdate, ResumeSkillCreate,
                                ResumeUpdate, OpenAIResumeUpdate, Resume, ResumeList, ResumeWithTemplate)
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.api.deps import APIKeyVerified

router = APIRouter()


@router.get("/", response_model=List[ResumeWithTemplate])
async def get_user_resumes(
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> List[ResumeWithTemplate]:
    """
    Get all resumes for the current user with full data.
    Only available for users with verified email.
    """
    resumes = await resume_crud.get_all_full_resumes_by_user_id(db, user_id=current_user.id)
    # Convert SQLAlchemy models to Pydantic schemas
    resume_schemas = [ResumeWithTemplate.model_validate(resume) for resume in resumes]
    return resume_schemas


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
    
    # Convert SQLAlchemy model to Pydantic schema
    resume_schema = ResumeInDB.model_validate(resume)
    return resume_schema


@router.get("/{resume_id}", response_model=ResumeWithTemplate)
async def get_resume(
    resume_id: UUID,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> ResumeWithTemplate:
    """
    Get a specific resume by ID with all related data.
    Only available for users with verified email.
    """
    resume = await resume_crud.get_full_resume(
        db, user_id=current_user.id, resume_id=resume_id
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    # Convert SQLAlchemy model to Pydantic schema
    resume_schema = ResumeWithTemplate.model_validate(resume)
    return resume_schema


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
    updated_resume = await resume_crud.get_by_user_id_and_id(db, user_id=current_user.id, resume_id=resume_id)
    # Convert SQLAlchemy model to Pydantic schema
    resume_schema = ResumeInDB.model_validate(updated_resume)
    return resume_schema


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
    # Convert SQLAlchemy model to Pydantic schema
    resume_schema = ResumeInDB.model_validate(updated_resume)
    return resume_schema


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
    
    # Convert SQLAlchemy model to Pydantic schema if it exists
    personal_info_schema = None
    if updated_info:
        from app.schemas.resume import ResumePersonalInfo
        personal_info_schema = ResumePersonalInfo.model_validate(updated_info)
    
    return {
        "resume_id": str(resume_id),
        "personal_info": personal_info_schema,
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
    
    # Convert SQLAlchemy model to Pydantic schema
    from app.schemas.resume import ResumeSkill
    skill_schema = ResumeSkill.model_validate(skill)
    
    return {
        "resume_id": str(resume_id),
        "skill": skill_schema,
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
    
    # Convert SQLAlchemy model to Pydantic schema
    from app.schemas.resume import ResumeExperience
    experience_schema = ResumeExperience.model_validate(experience)
    
    return {
        "resume_id": str(resume_id),
        "experience": experience_schema,
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
    
    # Convert SQLAlchemy model to Pydantic schema
    from app.schemas.resume import ResumeExperience
    experience_schema = ResumeExperience.model_validate(updated_experience)
    
    return {
        "resume_id": str(resume_id),
        "experience": experience_schema,
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
    
    # Convert SQLAlchemy model to Pydantic schema
    from app.schemas.resume import ResumeEducation
    education_schema = ResumeEducation.model_validate(education)
    
    return {
        "resume_id": str(resume_id),
        "education": education_schema,
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
    
    # Convert SQLAlchemy model to Pydantic schema
    from app.schemas.resume import ResumeEducation
    education_schema = ResumeEducation.model_validate(updated_education)
    
    return {
        "resume_id": str(resume_id),
        "education": education_schema,
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
    
    # Convert SQLAlchemy model to Pydantic schema
    from app.schemas.resume import ResumeExport
    export_schema = ResumeExport.model_validate(export_record)
    
    return {
        "resume_id": str(resume_id),
        "export_record": export_schema,
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
    
    # Convert SQLAlchemy models to Pydantic schemas
    from app.schemas.resume import ResumeExport
    export_schemas = [ResumeExport.model_validate(export) for export in export_history]
    
    return {
        "resume_id": str(resume_id),
        "export_history": export_schemas
    }


# OpenAI Structured Output endpoint
@router.post("/{resume_id}/ai-update")
async def update_resume_with_ai(
    resume_id: UUID,
    ai_update: OpenAIResumeUpdate,
    _: APIKeyVerified,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Update resume with AI-generated content using OpenAI structured output.
    All fields are optional - only provided fields will be updated/added.
    Requires valid API key for authentication.
    """
    # Check if resume exists
    resume = await resume_crud.get(db, id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
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
        # Only include non-None values
        personal_info_dict = {}
        if ai_update.personalInfo.firstName is not None:
            personal_info_dict['first_name'] = ai_update.personalInfo.firstName
        if ai_update.personalInfo.lastName is not None:
            personal_info_dict['last_name'] = ai_update.personalInfo.lastName
        if ai_update.personalInfo.middleName is not None:
            personal_info_dict['middle_name'] = ai_update.personalInfo.middleName
        if ai_update.personalInfo.phone is not None:
            personal_info_dict['phone'] = ai_update.personalInfo.phone
        if ai_update.personalInfo.email is not None:
            personal_info_dict['email'] = ai_update.personalInfo.email
        if ai_update.personalInfo.location is not None:
            personal_info_dict['location'] = ai_update.personalInfo.location
        
        if personal_info_dict:  # Only update if there are actual values
            personal_info_update = ResumePersonalInfoUpdate(**personal_info_dict)
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
    updated_resume = await resume_crud.get(db, id=resume_id)
    
    # Calculate updated fields
    personal_info_updated = False
    if ai_update.personalInfo:
        # Check if any non-None values were provided and actually updated
        personal_info_dict = {}
        if ai_update.personalInfo.firstName is not None:
            personal_info_dict['first_name'] = ai_update.personalInfo.firstName
        if ai_update.personalInfo.lastName is not None:
            personal_info_dict['last_name'] = ai_update.personalInfo.lastName
        if ai_update.personalInfo.middleName is not None:
            personal_info_dict['middle_name'] = ai_update.personalInfo.middleName
        if ai_update.personalInfo.phone is not None:
            personal_info_dict['phone'] = ai_update.personalInfo.phone
        if ai_update.personalInfo.email is not None:
            personal_info_dict['email'] = ai_update.personalInfo.email
        if ai_update.personalInfo.location is not None:
            personal_info_dict['location'] = ai_update.personalInfo.location
        
        # Check if we actually updated personal info
        if personal_info_dict:
            existing_personal_info = await resume_manager.get_personal_info(db, resume_id=resume_id)
            if existing_personal_info or ('first_name' in personal_info_dict and 'last_name' in personal_info_dict):
                personal_info_updated = True
    
    return {
        "result": "success"
    }


# Legacy endpoints (keeping for backward compatibility)
@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Upload resume file and create resume.
    Only available for users with verified email.
    """
    # Get default template (tero)
    template = await template_crud.get_by_slug(db, slug='tero')
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Default template not found"
        )
    
    # Create resume with uploaded file info
    resume_create = ResumeCreate(
        title=f"Resume from {file.filename}",
        template_id=template.id,
        professional_summary=""
    )
    
    resume = await resume_crud.create(db, obj_in=resume_create, user_id=current_user.id)
    
    # TODO: Process uploaded file and extract content
    # For now, just return the created resume
    
    return {
        "id": str(resume.id),
        "title": resume.title,
        "template_id": str(resume.template_id),
        "user_id": str(resume.user_id),
        "created_at": resume.created_at.isoformat(),
        "updated_at": resume.updated_at.isoformat()
    }


@router.put("/{resume_id}/template/{template_id}")
async def assign_template_to_resume(
    resume_id: UUID,
    template_id: UUID,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Assign a specific template to a resume by UUID.
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


@router.put("/{resume_id}/template/slug/{template_slug}")
async def assign_template_by_slug(
    resume_id: UUID,
    template_slug: str,
    current_user: VerifiedUser = None,
    db: AsyncDB = None
) -> Dict[str, Any]:
    """
    Assign a specific template to a resume by slug.
    Only available for users with verified email.
    """
    # Check if template exists by slug
    template = await template_crud.get_by_slug(db, slug=template_slug)
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
    resume_update = ResumeUpdate(template_id=template.id)
    updated_resume = await resume_crud.update(db, db_obj=resume, obj_in=resume_update)
    
    return {
        "id": str(updated_resume.id),
        "template_id": str(updated_resume.template_id),
        "template_slug": template_slug,
        "message": "Template assigned successfully"
    }
