"""Analysis API endpoints"""
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.api.deps import AsyncDB, CurrentUser
from app.database.crud.crud_user import user_crud
from app.schemas.analysis import AnalysisResult
from app.services.analysis.analysis_service import analysis_service

router = APIRouter()


@router.get("/", response_model=AnalysisResult)
async def get_analysis(
    db: AsyncDB,
    current_user: CurrentUser,
) -> Any:
    """
    Get analysis for current user's resume.
    Returns stored analysis if available, otherwise generates new one.
    Only available for users with verified email.
    """
    # Check if stored analysis exists
    stored_analysis = await user_crud.get_analysis_result(db, user_id=current_user.id)
    
    if stored_analysis:
        # Return stored analysis
        return AnalysisResult(**stored_analysis)
    
    # No stored analysis - generate new one
    resume_data = await user_crud.get_resume_data(db, user_id=current_user.id)
    
    if resume_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Analyze the resume
    analysis_result = await analysis_service.analyze_resume(resume_data)
    
    # Save to database (mode='json' converts datetime to ISO string)
    await user_crud.save_analysis_result(
        db, 
        user_id=current_user.id, 
        analysis_data=analysis_result.model_dump(mode='json')
    )
    
    return analysis_result


@router.post("/refresh", response_model=AnalysisResult)
async def refresh_analysis(
    db: AsyncDB,
    current_user: CurrentUser,
) -> Any:
    """
    Force regenerate analysis regardless of stored result.
    Saves new result to database.
    """
    # Get user's resume data
    resume_data = await user_crud.get_resume_data(db, user_id=current_user.id)
    
    if resume_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Always regenerate analysis
    analysis_result = await analysis_service.analyze_resume(resume_data)
    
    # Save to database (mode='json' converts datetime to ISO string)
    await user_crud.save_analysis_result(
        db,
        user_id=current_user.id,
        analysis_data=analysis_result.model_dump(mode='json')
    )
    
    return analysis_result

