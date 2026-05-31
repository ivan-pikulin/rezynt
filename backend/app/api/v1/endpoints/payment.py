import hmac
import uuid

from app.api.deps import AsyncDB, CurrentUser
from app.core.config import settings
from app.database.crud.crud_user import user_crud
from app.schemas.payment import (
    PaymentCheckoutResponse,
    YookassaWebhookEvent,
)
from app.schemas.user import UserPublic
from app.services.payment_service import payment_service
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

router = APIRouter()
webhook_router = APIRouter()


class PaymentActivationResponse(BaseModel):
    ok: bool
    user: UserPublic
    email_sent: bool
    email_queued: bool
    already_active: bool


@router.post("/checkout", response_model=PaymentCheckoutResponse)
async def create_payment_checkout(
    current_user: CurrentUser,
) -> dict:
    try:
        result = await payment_service.create_yookassa_payment(current_user)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))
    except RuntimeError as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(error))

    return {
        "payment_id": result.payment_id,
        "status": result.status,
        "confirmation_url": result.confirmation_url,
        "return_url": result.return_url,
    }


@router.post("/simulate-success", response_model=PaymentActivationResponse)
async def simulate_payment_success(
    db: AsyncDB,
    current_user: CurrentUser,
) -> dict:
    """
    Temporary endpoint used by the paywall button while real checkout is disabled.
    Activates the current account the same way a successful YooKassa webhook does.
    """
    payment_id = f"mock_{current_user.id}_{uuid.uuid4().hex}"

    try:
        result = await payment_service.activate_successful_payment(
            db,
            user=current_user,
            payment_id=payment_id,
        )
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))
    except RuntimeError as error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error))

    return {
        "ok": True,
        "user": result.user,
        "email_sent": result.email_sent,
        "email_queued": result.email_queued,
        "already_active": result.already_active,
    }


@webhook_router.post("/yookassa")
async def yookassa_webhook(
    event: YookassaWebhookEvent,
    db: AsyncDB,
    secret: str = Query(...),
) -> dict:
    """
    YooKassa webhook. Configure as:
    /api/v1/webhook/yookassa?secret=<YOOKASSA_WEBHOOK_SECRET>
    """
    if not hmac.compare_digest(secret, settings.YOOKASSA_WEBHOOK_SECRET):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    if event.event != "payment.succeeded":
        return {"ok": True, "ignored": event.event}

    if event.object.status != "succeeded":
        return {"ok": True, "ignored": event.object.status}

    raw_user_id = event.object.metadata.get("user_id")
    if not raw_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No user_id in payment metadata",
        )

    try:
        user_id = int(raw_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user_id in payment metadata",
        )

    user = await user_crud.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    try:
        result = await payment_service.activate_successful_payment(
            db,
            user=user,
            payment_id=event.object.id,
        )
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))
    except RuntimeError as error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error))

    return {
        "ok": True,
        "user_id": result.user.id,
        "email_sent": result.email_sent,
        "email_queued": result.email_queued,
        "already_active": result.already_active,
    }
