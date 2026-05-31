import httpx
import logging
import secrets
import string
import uuid
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import get_password_hash
from app.database.models import User
from app.schemas.payment import YookassaPaymentCreateResponse

logger = logging.getLogger(__name__)


@dataclass
class PaymentActivationResult:
    user: User
    email_sent: bool
    email_queued: bool
    already_active: bool


@dataclass
class PaymentCheckoutResult:
    payment_id: str
    status: str
    confirmation_url: str
    return_url: str


class PaymentService:
    def _get_yookassa_auth(self) -> tuple[str, str]:
        return (settings.YOOKASSA_SHOP_ID, settings.YOOKASSA_SECRET_KEY.get_secret_value())

    def _generate_password(self, length: int = 14) -> str:
        alphabet = string.ascii_letters + string.digits
        return "".join(secrets.choice(alphabet) for _ in range(length))

    async def create_yookassa_payment(self, user: User) -> PaymentCheckoutResult:
        if not user.email:
            raise ValueError("Cannot start payment without user email")

        if user.is_premium:
            raise ValueError("User already has paid access")

        return_url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/payment/welcome"
        payload = {
            "amount": {
                "value": "149.00",
                "currency": "RUB",
            },
            "capture": True,
            "confirmation": {
                "type": "redirect",
                "return_url": return_url,
            },
            "description": "Rezynt premium access",
            "metadata": {
                "user_id": str(user.id),
                "user_email": user.email,
            },
        }

        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(20.0),
                auth=self._get_yookassa_auth(),
            ) as client:
                response = await client.post(
                    "https://api.yookassa.ru/v3/payments",
                    json=payload,
                    headers={"Idempotence-Key": str(uuid.uuid4())},
                )
        except httpx.HTTPError as error:
            logger.exception("Failed to create YooKassa payment for user %s", user.id)
            raise RuntimeError("Failed to create YooKassa payment") from error

        if response.status_code >= 400:
            logger.error(
                "YooKassa payment creation failed for user %s: status=%s body=%s",
                user.id,
                response.status_code,
                response.text,
            )
            raise RuntimeError("YooKassa rejected payment creation request")

        try:
            parsed = YookassaPaymentCreateResponse.model_validate(response.json())
        except Exception as error:
            logger.exception("Invalid YooKassa payment response for user %s", user.id)
            raise RuntimeError("YooKassa payment response is invalid") from error

        confirmation_url = parsed.confirmation.confirmation_url
        if not confirmation_url:
            raise RuntimeError("YooKassa payment response is missing confirmation_url")

        logger.info("Created YooKassa payment %s for user %s", parsed.id, user.id)
        return PaymentCheckoutResult(
            payment_id=parsed.id,
            status=parsed.status,
            confirmation_url=confirmation_url,
            return_url=return_url,
        )

    async def activate_successful_payment(
        self,
        db: AsyncSession,
        *,
        user: User,
        payment_id: str,
    ) -> PaymentActivationResult:
        if not user.email:
            raise ValueError("Cannot activate paid access without user email")

        if user.is_premium and user.password_hash:
            logger.info(
                "Payment %s ignored because user %s already has paid access",
                payment_id,
                user.id,
            )
            return PaymentActivationResult(
                user=user,
                email_sent=False,
                email_queued=False,
                already_active=True,
            )

        password = self._generate_password()
        user.password_hash = get_password_hash(password)
        user.is_premium = True
        user.is_verified = True
        user.is_registered = True

        await db.commit()
        await db.refresh(user)

        email_queued = False
        try:
            from app.core.tasks import send_paid_access_email_task

            send_paid_access_email_task.delay(user.email, password)
            email_queued = True
        except Exception:
            logger.exception(
                "Payment %s activated paid access for user %s, but paid access email task was not queued",
                payment_id,
                user.id,
            )

        logger.info("Payment %s activated paid access for user %s", payment_id, user.id)
        return PaymentActivationResult(
            user=user,
            email_sent=False,
            email_queued=email_queued,
            already_active=False,
        )


payment_service = PaymentService()
