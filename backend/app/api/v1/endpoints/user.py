from app.api.deps import AsyncDB, CurrentUser, APIKeyVerified
from app.schemas import user as user_schemas
from app.database.crud.crud_user import user_crud
from fastapi import APIRouter, HTTPException, status
from uuid import UUID

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


@router.patch("/{user_id}/premium/enable", response_model=user_schemas.UserPublic)
async def enable_premium(
    user_id: UUID,
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
    user_id: UUID,
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
