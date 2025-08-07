from app.api.deps import AsyncDB, CurrentUser
from app.schemas import user as user_schemas
from fastapi import APIRouter

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
