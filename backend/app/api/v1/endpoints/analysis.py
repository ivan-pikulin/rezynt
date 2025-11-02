"""Analysis API endpoints"""
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.api.deps import AsyncDB, VerifiedUser
from app.database.crud.crud_user import user_crud
from app.schemas.analysis import AnalysisResult, ApplyFixRequest, ApplyFixResponse
from app.services.analysis.analysis_service import analysis_service

router = APIRouter()


@router.get("/", response_model=AnalysisResult)
async def get_analysis(
    db: AsyncDB,
    current_user: VerifiedUser,
) -> Any:
    """
    Get analysis for current user's resume.
    Only available for users with verified email.
    """
    # Get user's resume data
    resume_data = await user_crud.get_resume_data(db, user_id=current_user.id)
    
    if resume_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Analyze the resume
    analysis_result = await analysis_service.analyze_resume(resume_data)
    
    return analysis_result


@router.post("/refresh", response_model=AnalysisResult)
async def refresh_analysis(
    db: AsyncDB,
    current_user: VerifiedUser,
) -> Any:
    """
    Force refresh of analysis (bypass cache).
    Currently behaves the same as GET /analysis/ since caching is not yet implemented.
    """
    # Get user's resume data
    resume_data = await user_crud.get_resume_data(db, user_id=current_user.id)
    
    if resume_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Analyze the resume
    analysis_result = await analysis_service.analyze_resume(resume_data)
    
    return analysis_result


@router.post("/fix", response_model=ApplyFixResponse)
async def apply_fix(
    *,
    db: AsyncDB,
    current_user: VerifiedUser,
    request: ApplyFixRequest,
) -> Any:
    """
    Apply LLM-generated fix for a specific improvement point.
    """
    # Get user's resume data
    resume_data = await user_crud.get_resume_data(db, user_id=current_user.id)
    
    if resume_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Apply the fix
    fix_result = await analysis_service.apply_fix(
        point_id=request.point_id,
        field_path=request.field_path,
        resume=resume_data
    )
    
    if not fix_result.get("fixed"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to generate fix for this point"
        )
    
    return ApplyFixResponse(
        original=fix_result["original"],
        fixed=fix_result["fixed"],
        field_path=fix_result["field_path"]
    )

