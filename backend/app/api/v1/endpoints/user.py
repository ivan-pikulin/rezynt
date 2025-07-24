from fastapi import APIRouter, HTTPException

from app.api.deps import AsyncDB, CurrentUser, AdminUser
from app.database.crud.crud_user import user_crud
from app.schemas import user as user_schemas

router = APIRouter()


@router.get("/", response_model=list[user_schemas.UserPublic])
async def read_users(
    db: AsyncDB,
    current_user: CurrentUser,
) -> list:
    """
    Retrieve users.
    """
    users = await user_crud.get_all(db)
    return users


@router.get("/me", response_model=user_schemas.UserPublic)
async def read_user_me(
    db: AsyncDB,
    current_user: CurrentUser,
) -> dict:
    """
    Get details of currently authenticated user.
    """
    return current_user

@router.put("/{user_id}/role", response_model=user_schemas.UserPublic)
async def admin_update_user_role(
    user_id: int,
    role_update: user_schemas.UserRoleUpdate,
    db: AsyncDB,
    current_admin: AdminUser,
) -> dict:
    """
    Admin endpoint to update user role.
    """
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot change your own admin status"
        )
    
    updated_user = await user_crud.update_admin_status(db, user_id=user_id, is_admin=role_update.is_admin)
    if not updated_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    return updated_user
