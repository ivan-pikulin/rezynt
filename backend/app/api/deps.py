from typing import Annotated, AsyncGenerator
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import ALGORITHM
from app.database.session import SessionLocal
from app.database.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# database dependency
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session

AsyncDB = Annotated[AsyncSession, Depends(get_db)]

# authorized user dependency
async def get_current_user(
    db: AsyncDB,
    token: str = Depends(oauth2_scheme),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    try:
        user_uuid = UUID(user_id)
        user = await db.get(User, user_uuid)
        if user is None:
            raise credentials_exception
        return user
    except ValueError:
        raise credentials_exception

CurrentUser = Annotated[User, Depends(get_current_user)]

# verified user dependency
async def get_current_verified_user(
    current_user: CurrentUser
) -> User:
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please confirm your email address."
        )
    return current_user

VerifiedUser = Annotated[User, Depends(get_current_verified_user)]
