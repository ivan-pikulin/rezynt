from typing import Any, Dict

from app.api.deps import AsyncDB, VerifiedUser
from app.core.celery_app import celery_app
from app.core.config import settings
from app.core.tasks import process_resume_upload_task
from app.database.crud.crud_temp_resume_file import temp_resume_file_crud
from app.database.crud.crud_user import user_crud
from app.schemas.resume import PDFExportRequest, ResumeUpdate, ResumeResponse
from app.services.pdf_service import pdf_service
from fastapi import APIRouter, File, HTTPException, UploadFile, status

router = APIRouter()


@router.get("/", response_model=ResumeResponse)
async def get_resume(
    db: AsyncDB,
    current_user: VerifiedUser,
) -> Dict[str, Any]:
    """
    Get current user's resume from User.resume_data.
    Only available for users with verified email.
    """
    resume_data = await user_crud.get_resume_data(db, user_id=current_user.id)
    if resume_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return resume_data


@router.put("/", response_model=ResumeResponse)
async def update_resume(
    *,
    db: AsyncDB,
    resume_in: ResumeUpdate,
    current_user: VerifiedUser,
) -> Dict[str, Any]:
    """
    Full update of current user's resume.
    Only available for users with verified email.
    """
    resume_data = resume_in.model_dump()
    user = await user_crud.update_resume_data(db, user_id=current_user.id, resume_data=resume_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user.resume_data


@router.delete("/", response_model=Dict[str, Any])
async def delete_resume(
    *,
    db: AsyncDB,
    current_user: VerifiedUser,
) -> Dict[str, Any]:
    """
    Delete current user's resume by setting resume_data to empty dict.
    Only available for users with verified email.
    """
    user = await user_crud.delete_resume_data(db, user_id=current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "status": "success",
        "message": "Resume deleted successfully"
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
        
        # Start Celery task for processing
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
                'message': 'Processing resume with ParseService'
            }
        elif task.state == 'SUCCESS':
            task_result = task.result or {}
            response = {
                'state': task.state,
                'status': 'completed',
                'message': task_result.get('message', 'Resume processed successfully')
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
    Get the result of a resume upload processing task.
    Returns current task status regardless of completion state.
    Only available for users with verified email.
    """
    try:
        task = celery_app.AsyncResult(task_id)
        
        if task.state == 'PENDING':
            return {
                'state': task.state,
                'status': 'pending',
                'message': 'Task is pending'
            }
        elif task.state == 'STARTED':
            return {
                'state': task.state,
                'status': 'processing',
                'message': 'Processing resume with ParseService'
            }
        elif task.state == 'SUCCESS':
            result = task.result
            
            if result is None:
                return {
                    'state': task.state,
                    'status': 'error',
                    'message': 'Task completed but no result available'
                }
            
            # Verify that the task belongs to the current user
            if result.get('user_id') != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this task result"
                )
            
            return {
                'state': task.state,
                'status': 'completed',
                'message': result.get('message', 'Resume processed successfully')
            }
        elif task.state == 'FAILURE':
            result = task.result
            error_message = str(result) if result is not None else 'Unknown error occurred'
            
            return {
                'state': task.state,
                'status': 'error',
                'message': 'Failed to process resume',
                'error': error_message
            }
        else:
            return {
                'state': task.state,
                'status': 'unknown',
                'message': f'Unknown task state: {task.state}'
            }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get task result: {str(e)}"
        )


@router.post("/export-pdf")
async def export_resume_pdf(
    *,
    db: AsyncDB,
    export_request: PDFExportRequest,
    current_user: VerifiedUser,
):
    """
    Export resume to PDF using HTML content from frontend.
    Template slug is provided in request body.
    Only available for users with verified email.
    """
    # Validate template_slug
    if export_request.template_slug not in settings.VALID_TEMPLATE_SLUGS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid template_slug. Must be one of: {', '.join(settings.VALID_TEMPLATE_SLUGS)}"
        )
    
    # Check if template is premium and user has access
    if export_request.template_slug in settings.PREMIUM_TEMPLATE_SLUGS and not current_user.is_premium:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium template requires premium subscription"
        )
    
    try:
        # Get user's resume data for filename
        resume_data = await user_crud.get_resume_data(db, user_id=current_user.id)
        
        # Generate filename if not provided
        filename = export_request.filename
        if not filename:
            # Try to use user's name from resume data
            personal_info = resume_data.get('personal_info', {}) if resume_data else {}
            first_name = personal_info.get('first_name')
            last_name = personal_info.get('last_name')
            
            if first_name and last_name:
                full_name = f"{first_name}_{last_name}"
            else:
                full_name = f"resume_{current_user.id}"
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
