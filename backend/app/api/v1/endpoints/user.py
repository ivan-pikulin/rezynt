from app.api.deps import AdminUser, AsyncDB, CurrentUser
from app.database.crud.crud_user import user_crud
from app.schemas import user as user_schemas
from fastapi import APIRouter, HTTPException

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
