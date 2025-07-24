from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserBase(BaseModel):
    username: str
    is_admin: bool = False
    last_login: Optional[datetime] = None
    person_id: Optional[int] = None


class UserCreate(BaseModel):
    username: str
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    is_admin: Optional[bool] = None
    last_login: Optional[str] = None
    person_id: Optional[int] = None


class UserInDBBase(UserBase):
    id: int
    hashed_password: str

    class Config:
        from_attributes = True


# Public schema for API responses (no password)
class UserPublic(UserBase):
    id: int

    class Config:
        from_attributes = True


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    pass


class UserRoleUpdate(BaseModel):
    is_admin: bool
