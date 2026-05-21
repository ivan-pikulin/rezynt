from app.api.deps import AsyncDB, CurrentUser, APIKeyVerified
from app.schemas import user as user_schemas
from app.database.crud.crud_user import user_crud
from app.services.user_service import UserService
from app.core.tasks import send_onboarding_notification_task
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
    user_update: user_schemas.UserUpdateWithCode,
    db: AsyncDB,
    current_user: CurrentUser,
) -> user_schemas.UserPublic:
    """
    Update current user profile (first_name, last_name, email, etc).
    Email change requires verification code if current email is not null.
    """
    try:
        # Check if email is being changed
        email_changed = user_update.email and user_update.email != current_user.email
        
        if email_changed:
            # If current email is null (first time setting email)
            if current_user.email is None:
                # Allow setting email without verification, but mark as unverified
                update_data = user_update.model_dump(exclude={'verification_code'}, exclude_unset=True)
                update_data['is_verified'] = False
                user = await user_crud.update(db, db_obj=current_user, obj_in=update_data)
            else:
                # Current email exists - require verification code
                if not user_update.verification_code:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Для смены email требуется код подтверждения"
                    )
                
                # Verify the code
                service = UserService(db)
                is_valid = await service.verify_email_change_code(
                    user_id=current_user.id,
                    code=user_update.verification_code
                )
                
                if not is_valid:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Недействительный код подтверждения"
                    )
                
                # Code is valid - update email and mark as verified
                update_data = user_update.model_dump(exclude={'verification_code'}, exclude_unset=True)
                update_data['is_verified'] = True
                user = await user_crud.update(db, db_obj=current_user, obj_in=update_data)
                
                # Clear verification code after successful email change
                await user_crud.set_verification_data(db, user_id=user.id, token='', code='', code_type='email_change')
        else:
            # Email not changed - update other fields normally
            update_data = user_update.model_dump(exclude={'verification_code'}, exclude_unset=True)
            user = await user_crud.update(db, db_obj=current_user, obj_in=update_data)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Пользователь не найден"
            )
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/request-email-change-code", response_model=dict)
async def request_email_change_code(
    email_data: user_schemas.SendEmailChangeCode,
    db: AsyncDB,
    current_user: CurrentUser,
) -> dict:
    """
    Request verification code for email change.
    Sends code to the new email address.
    """
    try:
        service = UserService(db)
        success, token = await service.send_email_change_code(
            user_id=current_user.id,
            new_email=email_data.email
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Не удалось отправить код подтверждения"
            )
        
        return {
            "message": "Код подтверждения отправлен на новый адрес электронной почты",
            "token": token
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


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
            detail="Текущий пароль неверный"
        )
    
    return {"message": "Пароль успешно изменен"}


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
            detail="Пароль неверный"
        )
    
    return {"message": "Аккаунт успешно удален"}


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
            detail="Пользователь не найден"
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
            detail="Пользователь не найден"
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
            detail="Онбординг уже завершен"
        )
    
    user = await user_crud.complete_onboarding(
        db, 
        user_id=current_user.id, 
        responses=onboarding_data.responses
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    # Send onboarding notification email asynchronously
    try:
        send_onboarding_notification_task.delay(
            user_email=user.email,
            user_id=user.id,
            responses=onboarding_data.responses
        )
    except Exception as e:
        # Don't fail the request if email sending fails
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to send onboarding notification: {e}")
    
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
        "message": "Онбординг завершен"
    }