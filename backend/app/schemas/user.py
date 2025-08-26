from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserInDBBase(UserBase):
    id: int
    password_hash: str
    is_verified: bool
    is_premium: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Public schema for API responses (no password)
class UserPublic(UserBase):
    id: int
    is_verified: bool
    is_premium: bool
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
