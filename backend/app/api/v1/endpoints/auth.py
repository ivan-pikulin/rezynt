from datetime import timedelta
from typing import Any

from app.api.deps import AsyncDB
from app.core import security
from app.core.config import settings
from app.database.crud import user_crud
from app.schemas import RefreshRequest, Token, UserCreate, UserPublic, PasswordResetRequest, PasswordResetConfirm
from app.services.user_service import UserService
from fastapi import APIRouter, Body, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()


@router.post("/signup", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def signup(
    *,
    db: AsyncDB,
    user_in: UserCreate,
) -> Any:
    """
    Create new user with email confirmation.
    """
    try:
        service = UserService(db)
        user = await service.signup(user_in)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.post("/login", response_model=Token)
async def login(
    db: AsyncDB,
    form_data: OAuth2PasswordRequestForm = Depends()
) -> dict:
    """
    Login with email and password, return JWT and refresh token.
    """
    service = UserService(db)
    user = await service.authenticate_user(email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=400, detail="Incorrect email or password")
    elif not user_crud.is_active(user):
        raise HTTPException(
            status_code=400,
            detail="Email not verified. Please check your email and confirm registration."
        )

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token = security.create_refresh_token(user.id)
    return {
        "access_token": security.create_access_token(user.id, expires_delta=access_token_expires),
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.get("/confirm-email", status_code=status.HTTP_302_FOUND)
async def confirm_registration(
    token: str,
    db: AsyncDB,
    response: Response
) -> dict[str, str]:
    """
    Confirm user registration by email token and redirect to frontend.
    """
    try:
        service = UserService(db)
        user = await service.confirm_user(token=token)

        # Issue tokens after successful confirmation
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(user.id, expires_delta=access_token_expires)
        refresh_token = security.create_refresh_token(user.id)

        # Redirect to frontend with tokens in query for auto-login
        success_url = (
            f"{settings.FRONTEND_BASE_URL}/auth/email-confirmed"
            f"?access_token={access_token}&refresh_token={refresh_token}&token_type=bearer"
        )
        response.headers["Location"] = success_url

        return {"message": "Email confirmed", "redirect_url": success_url}
    except ValueError as e:
        # On error, redirect to error page
        error_url = f"{settings.FRONTEND_BASE_URL}/auth/email-confirmation-error?error={str(e)}"
        response.headers["Location"] = error_url
        response.status_code = status.HTTP_302_FOUND
        
        return {"message": "Email confirmation failed", "redirect_url": error_url}


@router.post("/request-password-reset", status_code=status.HTTP_200_OK)
async def request_password_reset(
    *,
    db: AsyncDB,
    reset_request: PasswordResetRequest,
) -> dict[str, str]:
    """
    Request password reset by sending email with reset token.
    """
    try:
        service = UserService(db)
        await service.request_password_reset(email=reset_request.email)
        
        return {
            "message": "If an account with that email exists, a password reset link has been sent."
        }
    except Exception as e:
        # For security, always return successful response
        return {
            "message": "If an account with that email exists, a password reset link has been sent."
        }


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    *,
    db: AsyncDB,
    reset_confirm: PasswordResetConfirm,
) -> dict[str, str]:
    """
    Reset password using token from email.
    """
    try:
        service = UserService(db)
        await service.confirm_password_reset(token=reset_confirm.token, new_password=reset_confirm.new_password)
        
        return {"message": "Password has been reset successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


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
