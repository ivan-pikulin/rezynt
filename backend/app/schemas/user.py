from datetime import datetime
from typing import Optional, Dict, Any

from pydantic import BaseModel, EmailStr

from .resume import ResumeData


class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    temp_file_id: Optional[str] = None
    guest_id: Optional[str] = None


class LandingSignupRequest(BaseModel):
    email: EmailStr
    resume_data: ResumeData


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserInDBBase(UserBase):
    id: int
    password_hash: str
    is_verified: bool
    is_premium: bool
    is_registered: bool
    has_completed_onboarding: bool
    onboarding_responses: Optional[Dict[str, Any]] = None
    credits: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Public schema for API responses (no password)
class UserPublic(UserBase):
    id: int
    guest_id: Optional[str] = None
    is_verified: bool
    is_premium: bool
    is_registered: bool
    has_completed_onboarding: bool
    onboarding_responses: Optional[Dict[str, Any]] = None
    credits: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    pass


class UserRoleUpdate(BaseModel):
    is_admin: bool


class UserPremiumUpdate(BaseModel):
    is_premium: bool


# Password reset schemas
class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


# Code-based verification schemas
class EmailVerificationByCode(BaseModel):
    email: EmailStr
    code: str


class PasswordResetByCode(BaseModel):
    email: EmailStr
    code: str
    new_password: str


class ResendVerificationCode(BaseModel):
    email: EmailStr
    code_type: str  # 'email_confirm' or 'password_reset'


# Email change schemas
class SendEmailChangeCode(BaseModel):
    email: EmailStr


class UserUpdateWithCode(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    verification_code: Optional[str] = None


# Onboarding schemas
class OnboardingResponse(BaseModel):
    experience: str
    job_search_status: str
    background_field: str
    resume_goal: str


class OnboardingComplete(BaseModel):
    responses: OnboardingResponse


# Profile management schemas
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class DeleteAccountRequest(BaseModel):
    password: str


# Guest session schemas
class GuestSessionRequest(BaseModel):
    guest_id: Optional[str] = None


class GuestSessionResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    guest_id: str


class GoogleLoginRequest(BaseModel):
    id_token: str
    guest_id: Optional[str] = None
