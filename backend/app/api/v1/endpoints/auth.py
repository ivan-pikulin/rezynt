from datetime import timedelta
from typing import Any

from app.api.deps import AsyncDB
from app.core import security
from app.core.config import settings
from app.database.crud import user_crud as user_crud
from app.schemas import RefreshRequest, Token, User, UserCreate
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()


@router.post("/signup", response_model=User)
async def create_user(
    *,
    db: AsyncDB,
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = await user_crud.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = await user_crud.create(db, obj_in=user_in)
    return user


@router.post("/login", response_model=Token)
async def login(
    db: AsyncDB,
    form_data: OAuth2PasswordRequestForm = Depends()
) -> dict:
    """
    Login with username and password, update last_login, return JWT and refresh token.
    """
    user = await user_crud.authenticate(db, username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=400, detail="Incorrect username or password")
    elif not user_crud.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    # Update last_login
    await user_crud.update_last_login(db, user.id)
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token = security.create_refresh_token(user.id)
    return {
        "access_token": security.create_access_token(user.id, expires_delta=access_token_expires),
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    db: AsyncDB,
    refresh_in: RefreshRequest = Body(...)
) -> dict:
    """
    Refresh JWT token using refresh token.
    """
    user_id = security.verify_refresh_token(refresh_in.refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(user_id, expires_delta=access_token_expires),
        "token_type": "bearer",
    }
