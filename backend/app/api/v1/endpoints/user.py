from app.api.deps import AsyncDB, CurrentUser, APIKeyVerified
from app.schemas import user as user_schemas
from app.database.crud.crud_user import user_crud
from fastapi import APIRouter, HTTPException, status

router = APIRouter()


@router.get("/me", response_model=user_schemas.UserPublic)
async def read_user_me(
    db: AsyncDB,
    current_user: CurrentUser,
) -> dict:
    """
    Get details of currently authenticated user.
    """
    return current_user


@router.patch("/me", response_model=user_schemas.UserPublic)
async def update_user_me(
    user_update: user_schemas.UserUpdate,
    db: AsyncDB,
    current_user: CurrentUser,
) -> user_schemas.UserPublic:
    """
    Update current user profile (first_name, last_name, etc).
    """
    user = await user_crud.update(db, db_obj=current_user, obj_in=user_update)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.post("/change-password", response_model=dict)
async def change_password(
    password_data: user_schemas.ChangePasswordRequest,
    db: AsyncDB,
    current_user: CurrentUser,
) -> dict:
    """
    Change user password after verifying current password.
    """
    user = await user_crud.change_password(
        db,
        user_id=current_user.id,
        current_password=password_data.current_password,
        new_password=password_data.new_password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    return {"message": "Password changed successfully"}


@router.delete("/me", response_model=dict)
async def delete_user_me(
    delete_data: user_schemas.DeleteAccountRequest,
    db: AsyncDB,
    current_user: CurrentUser,
) -> dict:
    """
    Delete/anonymize current user account after password verification.
    """
    user = await user_crud.delete_account(
        db,
        user_id=current_user.id,
        password=delete_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect"
        )
    
    return {"message": "Account deleted successfully"}


@router.patch("/{user_id}/premium/enable", response_model=user_schemas.UserPublic)
async def enable_premium(
    user_id: int,
    db: AsyncDB,
    _: APIKeyVerified,
) -> user_schemas.UserPublic:
    """
    Enable premium status for a user. Admin token required.
    """
    user = await user_crud.update_premium_status(db, user_id=user_id, is_premium=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.patch("/{user_id}/premium/disable", response_model=user_schemas.UserPublic)
async def disable_premium(
    user_id: int,
    db: AsyncDB,
    _: APIKeyVerified,
) -> user_schemas.UserPublic:
    """
    Disable premium status for a user. Admin token required.
    """
    user = await user_crud.update_premium_status(db, user_id=user_id, is_premium=False)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.post("/onboarding/complete", response_model=dict)
async def complete_onboarding(
    onboarding_data: user_schemas.OnboardingComplete,
    db: AsyncDB,
    current_user: CurrentUser,
) -> dict:
    """
    Complete user onboarding by saving responses.
    """
    if current_user.has_completed_onboarding:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Onboarding already completed"
        )
    
    user = await user_crud.complete_onboarding(
        db, 
        user_id=current_user.id, 
        responses=onboarding_data.responses
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "is_verified": user.is_verified,
            "is_premium": user.is_premium,
            "is_registered": user.is_registered,
            "has_completed_onboarding": user.has_completed_onboarding,
            "onboarding_responses": user.onboarding_responses,
            "credits": user.credits,
            "created_at": user.created_at.isoformat(),
            "updated_at": user.updated_at.isoformat()
        },
        "message": "Onboarding completed"
    }