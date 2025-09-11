from typing import Any, Dict, List

from app.api.deps import AsyncDB, VerifiedUser
from app.core.celery_app import celery_app
from app.core.config import settings
from app.core.tasks import process_resume_upload_task
from app.database.crud.crud_resume import resume_manager
from app.database.crud.crud_temp_resume_file import temp_resume_file_crud
from app.database.crud.crud_user import user_crud
from app.schemas.resume import (PDFExportRequest, ResumeCreate,
                                ResumePartialUpdate, ResumeUpdate)
from app.services.parse_service import ParseService
from app.services.pdf_service import pdf_service
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
    # Check user's plan and existing resumes
    user = await user_crud.get(db, id=current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's existing resumes count
    existing_resumes = await resume_manager.get_all_resumes(db, user_id=current_user.id)
    
    # Check if user is on free plan and already has a resume
    if not user.is_premium and len(existing_resumes) >= 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Free plan users can only create one resume. Please upgrade to premium to create additional resumes."
        )
    
    # Validate template_slug if provided
    if resume_in.template_slug:
        if resume_in.template_slug not in settings.VALID_TEMPLATE_SLUGS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid template_slug. Must be one of: {', '.join(settings.VALID_TEMPLATE_SLUGS)}"
            )
        # Check if template is premium and user has access
        if resume_in.template_slug in settings.PREMIUM_TEMPLATE_SLUGS and not user.is_premium:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Premium template requires premium subscription"
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


@router.patch("/{resume_id}", response_model=Dict[str, Any])
async def partial_update_resume(
    *,
    db: AsyncDB,
    resume_id: int,
    resume_update: ResumePartialUpdate,
    current_user: VerifiedUser,
) -> Dict[str, Any]:
    """
    Partially update a resume.
    Only available for users with verified email.
    """
    resume = await resume_manager.get_resume(db, user_id=current_user.id, resume_id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    # Perform partial update
    updated_resume = await resume_manager.partial_update_resume(db, resume_id=resume_id, resume_update=resume_update)
    return updated_resume.to_json()


@router.delete("/{resume_id}", response_model=Dict[str, Any])
async def delete_resume(
    *,
    db: AsyncDB,
    resume_id: int,
    current_user: VerifiedUser,
) -> Dict[str, Any]:
    """
    Delete a resume.
    Only available for users with verified email.
    """
    # Check if resume exists and belongs to user
    resume = await resume_manager.get_resume(db, user_id=current_user.id, resume_id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    # Delete the resume using the base CRUD remove method
    deleted_resume = await resume_manager.resume_crud.remove(db, id=resume_id)
    if not deleted_resume:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete resume"
        )
    
    return {
        "status": "success",
        "message": "Resume deleted successfully",
        "resume_id": resume_id
    }


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
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Starting resume upload for user {current_user.id}, filename: {file.filename}")
    
    # Check user's plan and existing resumes
    user = await user_crud.get(db, id=current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's existing resumes count
    existing_resumes = await resume_manager.get_all_resumes(db, user_id=current_user.id)
    
    # Check if user is on free plan and already has a resume
    if not user.is_premium and len(existing_resumes) >= 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Free plan users can only create one resume. Please upgrade to premium to create additional resumes."
        )
    
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.doc', '.docx')):
        logger.warning(f"Invalid file type: {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOC, and DOCX files are allowed"
        )
    
    try:
        # Read file content
        logger.info(f"Reading file content for {file.filename}")
        file_content = await file.read()
        logger.info(f"File content read successfully, size: {len(file_content)} bytes")
        
        # Start Celery task for processing (resume creation happens inside the task)
        logger.info(f"Starting Celery task for user {current_user.id}")
        task = process_resume_upload_task.delay(file_content, file.filename, current_user.id)
        logger.info(f"Celery task started successfully with ID: {task.id}")
        
        return {
            "task_id": task.id,
            "message": "File uploaded and processing started"
        }
        
    except Exception as e:
        logger.error(f"Error in resume upload for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )


@router.post("/temp-upload", response_model=Dict[str, Any])
async def temp_upload_resume(
    *,
    file: UploadFile = File(...),
) -> Dict[str, Any]:
    """
    Temporarily upload a resume file without processing.
    Used for landing page uploads before user registration.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Starting temp resume upload, filename: {file.filename}")
    
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(('.pdf', '.doc', '.docx')):
        logger.warning(f"Invalid file type: {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOC, and DOCX files are allowed"
        )
    
    try:
        # Read file content
        logger.info(f"Reading file content for {file.filename}")
        file_content = await file.read()
        logger.info(f"File content read successfully, size: {len(file_content)} bytes")
        
        # Validate file size (10MB limit)
        max_size = 10 * 1024 * 1024  # 10MB
        if len(file_content) > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 10MB limit"
            )
        
        # Create temporary file record
        from app.database.session import SessionLocal
        async with SessionLocal() as db:
            temp_file = await temp_resume_file_crud.create_temp_file(
                db=db,
                filename=file.filename,
                file_content=file_content,
                content_type=file.content_type or "application/octet-stream"
            )
        
        logger.info(f"Temp file created with ID: {temp_file.file_id}")
        
        return {
            "file_id": temp_file.file_id,
            "message": "File uploaded temporarily"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in temp resume upload: {e}", exc_info=True)
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
    # Validate template_slug
    if slug not in settings.VALID_TEMPLATE_SLUGS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid template_slug. Must be one of: {', '.join(settings.VALID_TEMPLATE_SLUGS)}"
        )
    
    # Check if template is premium and user has access
    if slug in settings.PREMIUM_TEMPLATE_SLUGS and not current_user.is_premium:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium template requires premium subscription"
        )
    
    # Check if resume exists and belongs to user
    resume = await resume_manager.get_resume(db, user_id=current_user.id, resume_id=resume_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    # Update resume with new template
    resume_update = ResumeUpdate(template_slug=slug)
    await resume_manager.update_resume(db, resume_id=resume_id, resume_update=resume_update)
    
    return {
        "status": "success"
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
            if resume.first_name and resume.last_name:
                full_name = f"{resume.first_name}_{resume.last_name}"
            else:
                full_name = f"resume_{resume_id}"
            filename = f"{full_name}_resume.pdf"
        
        # Generate PDF from HTML content
        # Apply watermark only for non-premium users
        use_watermark = not current_user.is_premium
        pdf_bytes, final_filename = pdf_service.generate_pdf_from_html(
            html_content=export_request.html_content,
            filename=filename,
            use_watermark=use_watermark
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
        elif task.state == 'STARTED':
            response = {
                'state': task.state,
                'status': 'processing',
                'message': 'Creating resume and processing with ParseService'
            }
        elif task.state == 'SUCCESS':
            task_result = task.result or {}
            response = {
                'state': task.state,
                'status': 'completed',
                'message': task_result.get('message', 'Resume created and processed successfully'),
                'resume_id': task_result.get('resume_id')
            }
        elif task.state == 'FAILURE':
            response = {
                'state': task.state,
                'status': 'error',
                'message': 'Task failed',
                'error': str(task.result) if task.result is not None else 'Unknown error'
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
        
        if result is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Task completed but no result available"
            )
        
        # Verify that the task belongs to the current user
        if result.get('user_id') != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this task result"
            )
        
        return {
            'status': 'completed',
            'resume_id': result.get('resume_id'),
            'message': 'Resume created and processed successfully'
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
        result = await parse_service.test_structured_output(sample_text)
        
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
