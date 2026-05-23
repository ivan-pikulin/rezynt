import logging
import secrets
import string
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.database.models import User

logger = logging.getLogger(__name__)


@dataclass
class PaymentActivationResult:
    user: User
    email_sent: bool
    email_queued: bool
    already_active: bool


class PaymentService:
    def _generate_password(self, length: int = 14) -> str:
        alphabet = string.ascii_letters + string.digits
        return "".join(secrets.choice(alphabet) for _ in range(length))

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
