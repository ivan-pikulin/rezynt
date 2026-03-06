from datetime import timedelta
from typing import Any

from app.api.deps import AsyncDB
from app.core import security
from app.core.config import settings
from app.database.crud import user_crud
from app.database.crud.crud_temp_resume_file import temp_resume_file_crud
from app.schemas import (EmailVerificationByCode, GoogleLoginRequest,
                         GuestSessionRequest, GuestSessionResponse,
                         PasswordResetByCode, PasswordResetConfirm,
                         PasswordResetRequest, RefreshRequest,
                         ResendVerificationCode, Token, UserCreate,
                         UserPublic)
from app.services.user_service import UserService
from fastapi import APIRouter, Body, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()


@router.post("/guest", response_model=GuestSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_guest_session(
    *,
    db: AsyncDB,
    request: GuestSessionRequest = Body(default=GuestSessionRequest()),
) -> dict:
    """
    Create a guest session without requiring email/password.
    Returns JWT tokens and guest_id for the session.
    If guest_id is provided, attempts to find existing guest or creates new one.
    """
    guest_user = None
    
    if request.guest_id:
        guest_user = await user_crud.get_by_guest_id(db, guest_id=request.guest_id)
    
    if not guest_user:
        guest_user = await user_crud.create_guest(db, guest_id=request.guest_id)
    
    # Generate tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        guest_user.id, 
        expires_delta=access_token_expires,
        guest_id=guest_user.guest_id,
        is_registered=False
    )
    refresh_token = security.create_refresh_token(
        guest_user.id,
        guest_id=guest_user.guest_id,
        is_registered=False
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "guest_id": guest_user.guest_id,
    }


@router.post("/signup", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def signup(
    *,
    db: AsyncDB,
    user_in: UserCreate,
) -> Any:
    """
    Create new user with email confirmation.
    If temp_file_id is provided, link it to the user after creation.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Signup request for email: {user_in.email}, temp_file_id: {user_in.temp_file_id}")
    
    try:
        service = UserService(db)
        user = await service.signup(user_in)
        
        # If temp_file_id is provided, link it to the user
        if user_in.temp_file_id:
            logger.info(f"Linking temp file {user_in.temp_file_id} to user {user.id}")
            temp_file = await temp_resume_file_crud.link_to_user(
                db=db, 
                file_id=user_in.temp_file_id, 
                user_id=user.id
            )
            if not temp_file:
                # Log warning but don't fail registration
                logger.warning(f"Failed to link temp file {user_in.temp_file_id} to user {user.id}")
            else:
                logger.info(f"Successfully linked temp file {user_in.temp_file_id} to user {user.id}")
        else:
            logger.info(f"No temp_file_id provided for user {user.id}")
        
        return user
    except ValueError as e:
        logger.error(f"Signup error for {user_in.email}: {e}")
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
    refresh_token = security.create_refresh_token(
        user.id,
        guest_id=user.guest_id,
        is_registered=user.is_registered
    )
    return {
        "access_token": security.create_access_token(
            user.id, 
            expires_delta=access_token_expires,
            guest_id=user.guest_id,
            is_registered=user.is_registered
        ),
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "guest_id": user.guest_id,
    }


@router.post("/google", response_model=Token)
async def google_login(
    *,
    db: AsyncDB,
    google_login_in: GoogleLoginRequest,
) -> dict:
    """
    Login or signup using a Google ID token.
    """
    service = UserService(db)
    try:
        user = await service.authenticate_google_user(
            id_token=google_login_in.id_token,
            guest_id=google_login_in.guest_id,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.id,
        expires_delta=access_token_expires,
        guest_id=user.guest_id,
        is_registered=user.is_registered,
    )
    refresh_token = security.create_refresh_token(
        user.id,
        guest_id=user.guest_id,
        is_registered=user.is_registered,
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "guest_id": user.guest_id,
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
        access_token = security.create_access_token(
            user.id, 
            expires_delta=access_token_expires,
            guest_id=user.guest_id,
            is_registered=user.is_registered
        )
        refresh_token = security.create_refresh_token(
            user.id,
            guest_id=user.guest_id,
            is_registered=user.is_registered
        )

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
    
    # Get user to include guest_id and is_registered in new token
    user = await user_crud.get(db, id=int(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user_id, 
            expires_delta=access_token_expires,
            guest_id=user.guest_id,
            is_registered=user.is_registered
        ),
        "refresh_token": refresh_in.refresh_token,
        "token_type": "bearer",
        "guest_id": user.guest_id,
    }


@router.post("/confirm-email-by-code", status_code=status.HTTP_200_OK)
async def confirm_email_by_code(
    *,
    db: AsyncDB,
    verification_request: EmailVerificationByCode,
) -> dict[str, str]:
    """
    Confirm user registration by 6-digit verification code.
    If user has a temp resume file, process it and return task_id.
    """
    import logging
    from app.database.crud.crud_temp_resume_file import temp_resume_file_crud
    from app.core.tasks import process_resume_upload_task
    
    logger = logging.getLogger(__name__)
    
    try:
        service = UserService(db)
        user = await service.confirm_user_by_code(
            code=verification_request.code, 
            email=verification_request.email
        )

        # Issue tokens after successful confirmation
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            user.id, 
            expires_delta=access_token_expires,
            guest_id=user.guest_id,
            is_registered=user.is_registered
        )
        refresh_token = security.create_refresh_token(
            user.id,
            guest_id=user.guest_id,
            is_registered=user.is_registered
        )

        # Check if user has a temp resume file
        temp_file = await temp_resume_file_crud.get_by_user_id(db, user.id)
        
        response_data = {
            "message": "Email confirmed successfully",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
        if temp_file:
            logger.info(f"Processing temp resume file {temp_file.file_id} for user {user.id}")
            
            try:
                # Read file content
                with open(temp_file.file_path, 'rb') as f:
                    file_content = f.read()
                
                # Start Celery task for processing
                task = process_resume_upload_task.delay(
                    file_content, 
                    temp_file.filename, 
                    user.id
                )
                
                logger.info(f"Started resume processing task {task.id} for user {user.id}")
                
                # Delete temp file after successful task start
                await temp_resume_file_crud.delete_temp_file(db, temp_file)
                
                # Add task_id to response
                response_data["task_id"] = task.id
                response_data["message"] = "Email confirmed and resume processing started"
                
            except Exception as e:
                logger.error(f"Failed to process temp resume for user {user.id}: {e}")
                # Don't fail email confirmation if resume processing fails
                response_data["message"] = "Email confirmed (resume processing failed)"

        return response_data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/reset-password-by-code", status_code=status.HTTP_200_OK)
async def reset_password_by_code(
    *,
    db: AsyncDB,
    reset_request: PasswordResetByCode,
) -> dict[str, str]:
    """
    Reset password using 6-digit verification code.
    """
    try:
        service = UserService(db)
        user = await service.confirm_password_reset_by_code(
            code=reset_request.code,
            email=reset_request.email,
            new_password=reset_request.new_password
        )
        
        return {
            "message": "Password reset successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/resend-verification-code", status_code=status.HTTP_200_OK)
async def resend_verification_code(
    *,
    db: AsyncDB,
    resend_request: ResendVerificationCode,
) -> dict[str, str]:
    """
    Resend verification code for email confirmation or password reset.
    """
    if resend_request.code_type not in ['email_confirm', 'password_reset']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid code type. Must be 'email_confirm' or 'password_reset'"
        )
    
    try:
        service = UserService(db)
        success, token = await service.resend_verification_code(
            email=resend_request.email,
            code_type=resend_request.code_type
        )
        
        if success:
            return {
                "message": "Verification code resent successfully",
                "token": token
            }
        else:
            return {
                "message": "Failed to send verification code"
            }
    except Exception as e:
        # For security, always return successful response
        return {
            "message": "If an account with that email exists, a verification code has been sent."
        }
