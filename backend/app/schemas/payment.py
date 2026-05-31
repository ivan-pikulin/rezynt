from pydantic import BaseModel, Field


class PaymentCheckoutResponse(BaseModel):
    payment_id: str
    status: str
    confirmation_url: str
    return_url: str


class YookassaPaymentConfirmation(BaseModel):
    type: str
    return_url: str
    confirmation_url: str | None = None


class YookassaPaymentCreateResponse(BaseModel):
    id: str
    status: str
    confirmation: YookassaPaymentConfirmation


class YookassaWebhookPaymentObject(BaseModel):
    id: str
    status: str
    metadata: dict[str, str] = Field(default_factory=dict)


class YookassaWebhookEvent(BaseModel):
    type: str | None = None
    event: str
    object: YookassaWebhookPaymentObject
