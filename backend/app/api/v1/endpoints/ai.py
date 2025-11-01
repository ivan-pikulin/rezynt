from typing import Any, Dict

from app.api.deps import APIKeyVerified, AsyncDB
from app.database.crud.crud_user import user_crud
from app.schemas.resume import ResumeUpdate, ResumeResponse
from fastapi import APIRouter, HTTPException, status

router = APIRouter()


@router.get("/resume/{user_id}", response_model=ResumeResponse, tags=["resume"])
async def get_full_resume(
    *,
    db: AsyncDB,
    user_id: int,
    _: APIKeyVerified,
) -> Dict[str, Any]:
    """
    Get full resume for a user in structured format.
    Returns complete resume with all related data from User.resume_data JSONB field.
    Requires valid API key for authorization.
    """
    # Get the user's resume data
    resume_data = await user_crud.get_resume_data(db, user_id=user_id)
    if resume_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return resume_data


@router.put("/resume/{user_id}", response_model=ResumeResponse, tags=["resume"])
async def update_resume(
    *,
    db: AsyncDB,
    user_id: int,
    resume_data: ResumeUpdate,
    _: APIKeyVerified,
) -> Dict[str, Any]:
    """
    Update user's resume data.
    Requires valid API key for authorization.
    """
    # Update user's resume data
    user = await user_crud.update_resume_data(db, user_id=user_id, resume_data=resume_data.model_dump())
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user.resume_data
