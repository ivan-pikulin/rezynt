import os
import tempfile
from typing import Any, Dict, List

from app.api.deps import APIKeyVerified, AsyncDB, VerifiedUser
from app.core.celery_app import celery_app
from app.core.tasks import process_resume_upload
from app.database.crud.crud_resume import resume_manager
from app.database.crud.crud_template import template_crud
from app.schemas.resume import (AIResumeUpdate, PDFExportRequest, ResumeCreate,
                                ResumeEducationCreate, ResumeExperienceCreate,
                                ResumePersonalInfoUpdate, ResumeUpdate)
from app.services.pdf_service import pdf_service
from app.services.parse_service import ParseService
from fastapi import APIRouter, File, HTTPException, UploadFile, status

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
    Upload a resume file and process it with markitdown.
    Only available for users with verified email.
    """
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.doc', '.docx')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOC, and DOCX files are allowed"
        )
    
    try:
        # Create resume first
        resume_create = ResumeCreate(
            title=f"Resume from {file.filename}",
            template_id=1,  # Default template
            professional_summary=""
        )
        
        resume = await resume_manager.create_resume(db, obj_in=resume_create, user_id=current_user.id)
        
        # Save uploaded file to temporary location
        file_content = await file.read()
        temp_dir = tempfile.gettempdir()
        temp_file_path = os.path.join(temp_dir, f"resume_{resume.id}_{file.filename}")
        
        with open(temp_file_path, 'wb') as temp_file:
            temp_file.write(file_content)
        
        # Start Celery task for processing
        task = process_resume_upload.delay(temp_file_path, current_user.id, resume.id)
        
        return {
            "id": resume.id,
            "task_id": task.id,
            "message": "File uploaded and processing started"
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
    resume = await resume_manager.get_resume_by_id(db, resume_id=resume_id)
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
    updated_resume = await resume_manager.get_resume_by_id(db, resume_id=resume_id)
    
    return {
        "resume_id": resume_id,
        "message": "Resume updated successfully with AI content",
        "updated_fields": updated_fields,
        "resume": updated_resume.to_json()
    }


@router.post("/{resume_id}/export-pdf")
async def export_resume_pdf(
    *,
    db: AsyncDB,
    resume_id: int,
    export_request: PDFExportRequest,
    current_user: VerifiedUser,
):
    """
    Export resume to PDF using HTML content from frontend.
    Only available for users with verified email.
    """
    # Verify resume belongs to current user
    resume = await resume_manager.get_resume(db, user_id=current_user.id, resume_id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    try:
        # Generate filename if not provided
        filename = export_request.filename
        if not filename:
            # Use user's name from resume data
            personal_info = resume.personal_info
            if personal_info and personal_info.first_name and personal_info.last_name:
                full_name = f"{personal_info.first_name}_{personal_info.last_name}"
            else:
                full_name = f"resume_{resume_id}"
            filename = f"{full_name}_resume.pdf"
        
        # Generate PDF from HTML content
        pdf_bytes, final_filename = pdf_service.generate_pdf_from_html(
            html_content=export_request.html_content,
            filename=filename
        )
        
        # Return PDF as file response
        return pdf_service.create_file_response(pdf_bytes, final_filename)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export PDF: {str(e)}"
        )


@router.get("/upload/status/{task_id}", response_model=Dict[str, Any])
async def get_upload_status(
    *,
    task_id: str,
    current_user: VerifiedUser,
) -> Dict[str, Any]:
    """
    Get the status of a resume upload processing task.
    Only available for users with verified email.
    """
    try:
        task = celery_app.AsyncResult(task_id)
        
        if task.state == 'PENDING':
            response = {
                'state': task.state,
                'status': 'pending',
                'message': 'Task is pending'
            }
        elif task.state == 'PROCESSING':
            response = {
                'state': task.state,
                'status': 'processing',
                'message': task.info.get('message', 'Processing resume')
            }
        elif task.state == 'SUCCESS':
            response = {
                'state': task.state,
                'status': 'completed',
                'message': task.info.get('message', 'Resume processed successfully'),
                'text_content': task.info.get('text_content'),
                'resume_id': task.info.get('resume_id')
            }
        elif task.state == 'FAILURE':
            response = {
                'state': task.state,
                'status': 'error',
                'message': task.info.get('message', 'Task failed'),
                'error': task.info.get('error')
            }
        else:
            response = {
                'state': task.state,
                'status': 'unknown',
                'message': 'Unknown task state'
            }
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get task status: {str(e)}"
        )


@router.get("/upload/result/{task_id}", response_model=Dict[str, Any])
async def get_upload_result(
    *,
    task_id: str,
    current_user: VerifiedUser,
) -> Dict[str, Any]:
    """
    Get the result of a completed resume upload processing task.
    Only available for users with verified email.
    """
    try:
        task = celery_app.AsyncResult(task_id)
        
        if task.state != 'SUCCESS':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Task is not completed. Current state: {task.state}"
            )
        
        result = task.result
        
        # Verify that the task belongs to the current user
        if result.get('user_id') != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this task result"
            )
        
        return {
            'status': 'completed',
            'text_content': result.get('text_content'),
            'resume_id': result.get('resume_id'),
            'message': 'Resume processed successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get task result: {str(e)}"
        )


@router.post("/test-structured-output", response_model=Dict[str, Any])
async def test_structured_output(
    *,
    current_user: VerifiedUser,
    sample_text: str = None
) -> Dict[str, Any]:
    """
    Test OpenAI Structured Outputs feature with sample resume text.
    Only available for users with verified email.
    """
    try:
        parse_service = ParseService()
        result = parse_service.test_structured_output(sample_text)
        
        return {
            "success": result.get("success", False),
            "data": result,
            "message": "Structured output test completed"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to test structured output: {str(e)}"
        )
