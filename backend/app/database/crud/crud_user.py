from typing import Any, Dict, Optional, Union
import uuid

from app.core.security import get_password_hash, verify_password
from app.database.crud.base import CRUDBase
from app.database.models import User
from app.schemas import UserCreate, UserUpdate, OnboardingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        result = await db.execute(select(self.model).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_google_sub(self, db: AsyncSession, *, google_sub: str) -> Optional[User]:
        result = await db.execute(select(self.model).where(User.google_sub == google_sub))
        return result.scalar_one_or_none()

    async def get_by_guest_id(self, db: AsyncSession, *, guest_id: str) -> Optional[User]:
        """Get user by guest_id"""
        result = await db.execute(select(self.model).where(User.guest_id == guest_id))
        return result.scalar_one_or_none()

    async def create_guest(self, db: AsyncSession, guest_id: Optional[str] = None) -> User:
        """Create a guest user with no email/password"""
        if not guest_id:
            guest_id = str(uuid.uuid4())
        db_obj = User(
            guest_id=guest_id,
            email=None,
            password_hash=None,
            auth_provider="guest",
            is_verified=False,
            is_registered=False,
            credits=20,  # Same as registered users
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        # Check if guest_id is provided - convert guest to registered
        if obj_in.guest_id:
            guest_user = await self.get_by_guest_id(db, guest_id=obj_in.guest_id)
            if guest_user:
                return await self.convert_guest_to_registered(
                    db,
                    guest_user=guest_user,
                    email=obj_in.email,
                    password=obj_in.password
                )
        
        # Create new registered user
        db_obj = User(
            email=obj_in.email,
            password_hash=get_password_hash(obj_in.password),
            auth_provider="email",
            is_verified=False,
            is_registered=True,
            credits=20,  # Set 20 credits by default
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def convert_guest_to_registered(
        self,
        db: AsyncSession,
        *,
        guest_user: User,
        email: str,
        password: str
    ) -> User:
        """Convert a guest user to a registered user"""
        # Check if email already exists
        existing_user = await self.get_by_email(db, email=email)
        if existing_user and existing_user.id != guest_user.id:
            raise ValueError("Пользователь с таким адресом электронной почты уже существует")
        
        # Update guest user to registered
        guest_user.email = email
        guest_user.password_hash = get_password_hash(password)
        guest_user.auth_provider = "email"
        guest_user.google_sub = None
        guest_user.is_registered = True
        guest_user.is_verified = False
        # Keep guest_id for reference
        
        await db.commit()
        await db.refresh(guest_user)
        return guest_user

    async def create_google_user(
        self,
        db: AsyncSession,
        *,
        email: str,
        google_sub: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        guest_id: Optional[str] = None,
    ) -> User:
        existing_user = await self.get_by_email(db, email=email)
        if existing_user:
            raise ValueError("Пользователь с таким адресом электронной почты уже существует")

        existing_google = await self.get_by_google_sub(db, google_sub=google_sub)
        if existing_google:
            raise ValueError("Аккаунт Google уже привязан к другому пользователю")

        db_obj = User(
            email=email,
            password_hash=None,
            first_name=first_name,
            last_name=last_name,
            guest_id=guest_id,
            auth_provider="google",
            google_sub=google_sub,
            is_verified=True,
            is_registered=True,
            credits=20,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def link_google_account(
        self,
        db: AsyncSession,
        *,
        user: User,
        google_sub: str,
        email: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
    ) -> User:
        existing_google = await self.get_by_google_sub(db, google_sub=google_sub)
        if existing_google and existing_google.id != user.id:
            raise ValueError("Аккаунт Google уже привязан к другому пользователю")

        if user.email != email:
            existing_email = await self.get_by_email(db, email=email)
            if existing_email and existing_email.id != user.id:
                raise ValueError("Пользователь с таким адресом электронной почты уже существует")

        if not user.email:
            user.email = email

        if first_name and not user.first_name:
            user.first_name = first_name
        if last_name and not user.last_name:
            user.last_name = last_name

        user.google_sub = google_sub
        user.auth_provider = "google"
        user.is_verified = True
        user.is_registered = True

        await db.commit()
        await db.refresh(user)
        return user

    async def update(
        self, db: AsyncSession, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        # Check email uniqueness if email is being updated
        if update_data.get("email") and update_data["email"] != db_obj.email:
            existing_user = await self.get_by_email(db, email=update_data["email"])
            if existing_user and existing_user.id != db_obj.id:
                raise ValueError("Пользователь с таким адресом электронной почты уже существует")
        
        if update_data.get("password"):
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["password_hash"] = hashed_password
        return await super().update(db, db_obj=db_obj, obj_in=update_data)

    async def authenticate(self, db: AsyncSession, *, email: str, password: str) -> Optional[User]:
        user = await self.get_by_email(db, email=email)
        if not user:
            return None
        if not user.password_hash:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def is_active(self, user: User) -> bool:
        return user.is_verified

    async def confirm_email(self, db: AsyncSession, *, user_id: int) -> Optional[User]:
        """Mark user email as verified"""
        result = await db.execute(select(self.model).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            user.is_verified = True
            await db.commit()
            await db.refresh(user)
        return user

    async def update_password(self, db: AsyncSession, *, user_id: int, new_password: str) -> Optional[User]:
        """Update user password"""
        result = await db.execute(select(self.model).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            user.password_hash = get_password_hash(new_password)
            await db.commit()
            await db.refresh(user)
        return user

    async def update_premium_status(self, db: AsyncSession, *, user_id: int, is_premium: bool) -> Optional[User]:
        """
        Update premium status of a user. This method should only be called by admin endpoints.
        """
        user = await self.get(db, id=user_id)
        if user:
            user.is_premium = is_premium
            await db.commit()
            await db.refresh(user)
        return user

    async def consume_credit(self, db: AsyncSession, *, user_id: int) -> Optional[User]:
        """
        Consume one credit from user. Returns user if successful, None if no credits left.
        """
        user = await self.get(db, id=user_id)
        if user and user.credits > 0:
            user.credits -= 1
            await db.commit()
            await db.refresh(user)
            return user
        return None

    async def has_credits(self, db: AsyncSession, *, user_id: int) -> bool:
        """
        Check if user has credits available.
        """
        user = await self.get(db, id=user_id)
        return user is not None and user.credits > 0

    async def complete_onboarding(self, db: AsyncSession, *, user_id: int, responses: OnboardingResponse) -> Optional[User]:
        """
        Complete user onboarding by saving responses and marking onboarding as completed.
        """
        user = await self.get(db, id=user_id)
        if user:
            user.has_completed_onboarding = True
            user.onboarding_responses = responses.model_dump()
            await db.commit()
            await db.refresh(user)
        return user

    async def set_verification_data(self, db: AsyncSession, *, user_id: int, token: str, code: str, code_type: str = 'email_confirm') -> Optional[User]:
        """
        Set verification token and code for user.
        """
        user = await self.get(db, id=user_id)
        if user:
            if code_type == 'email_confirm':
                user.verification_token = token
                user.verification_code = code
            elif code_type == 'password_reset':
                user.password_reset_token = token
                user.password_reset_code = code
            elif code_type == 'email_change':
                # Reuse verification_token and verification_code for email change
                user.verification_token = token
                user.verification_code = code
            await db.commit()
            await db.refresh(user)
        return user

    async def verify_code(self, db: AsyncSession, *, email: str = None, code: str, code_type: str = 'email_confirm', user_id: int = None) -> Optional[User]:
        """
        Verify code for user by email or user_id and code.
        For email_change, user_id should be provided instead of email.
        """
        if user_id:
            user = await self.get(db, id=user_id)
        else:
            user = await self.get_by_email(db, email=email)
        
        if user:
            if code_type == 'email_confirm' and user.verification_code == code:
                return user
            elif code_type == 'password_reset' and user.password_reset_code == code:
                return user
            elif code_type == 'email_change' and user.verification_code == code:
                return user
        return None

    async def get_resume_data(self, db: AsyncSession, *, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Get resume data from user's resume_data JSONB field.
        Returns None if user not found, empty dict if no resume data.
        """
        user = await self.get(db, id=user_id)
        if not user:
            return None
        return user.resume_data or {}

    async def update_resume_data(self, db: AsyncSession, *, user_id: int, resume_data: Dict[str, Any]) -> Optional[User]:
        """
        Update user's resume data in resume_data JSONB field.
        """
        user = await self.get(db, id=user_id)
        if user:
            user.resume_data = resume_data
            await db.commit()
            await db.refresh(user)
        return user

    async def delete_resume_data(self, db: AsyncSession, *, user_id: int) -> Optional[User]:
        """
        Delete user's resume data by setting resume_data to empty dict.
        """
        user = await self.get(db, id=user_id)
        if user:
            user.resume_data = {}
            await db.commit()
            await db.refresh(user)
        return user

    async def get_analysis_result(self, db: AsyncSession, *, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Get stored analysis result from user's analysis_result JSONB field.
        Returns None if user not found or no analysis has been generated.
        """
        user = await self.get(db, id=user_id)
        if not user:
            return None
        return user.analysis_result

    async def save_analysis_result(self, db: AsyncSession, *, user_id: int, analysis_data: Dict[str, Any]) -> Optional[User]:
        """
        Save analysis result to user's analysis_result JSONB field.
        Also updates analysis_generated_at timestamp.
        """
        from datetime import datetime
        
        user = await self.get(db, id=user_id)
        if user:
            user.analysis_result = analysis_data
            user.analysis_generated_at = datetime.utcnow()
            await db.commit()
            await db.refresh(user)
        return user

    async def mark_improvement_fixed(self, db: AsyncSession, *, user_id: int, point_id: str, is_fixed: bool = True) -> Optional[Dict[str, Any]]:
        """
        Mark an improvement point as fixed/unfixed in stored analysis result.
        Updates the is_fixed flag and recalculates score based on fixed points.
        """
        user = await self.get(db, id=user_id)
        if not user or not user.analysis_result:
            return None

        # Deep copy to avoid mutation issues
        import copy
        analysis_data = copy.deepcopy(user.analysis_result)

        # Find and update the improvement point in all sections
        updated = False
        for section in analysis_data.get('sections', []):
            for point in section.get('improvement_points', []):
                if point.get('id') == point_id:
                    point['is_fixed'] = is_fixed
                    updated = True
                    break
            if updated:
                break

        if updated:
            # Recalculate overall score by summing penalties from NON-FIXED points only
            total_penalty = 0
            for section in analysis_data.get('sections', []):
                for point in section.get('improvement_points', []):
                    if not point.get('is_fixed', False):
                        total_penalty += point.get('score_impact', 0)

            # Calculate new score (max 100)
            new_score = max(0, min(100, 100 - total_penalty))
            analysis_data['score'] = new_score

            # Update label and subtitle based on new score
            if new_score >= 90:
                analysis_data['label'] = 'Excellent'
                analysis_data['subtitle'] = 'Outstanding resume!'
            elif new_score >= 80:
                analysis_data['label'] = 'Strong'
                analysis_data['subtitle'] = 'Almost perfect!'
            elif new_score >= 60:
                analysis_data['label'] = 'Good'
                analysis_data['subtitle'] = 'Looking solid!'
            elif new_score >= 40:
                analysis_data['label'] = 'Fair'
                analysis_data['subtitle'] = "You're on the right track!"
            else:
                analysis_data['label'] = 'Weak'
                analysis_data['subtitle'] = "Let's work on it!"

            # Recalculate section scores and statuses
            for section in analysis_data.get('sections', []):
                section_penalty = sum(
                    point.get('score_impact', 0)
                    for point in section.get('improvement_points', [])
                    if not point.get('is_fixed', False)
                )
                section_score = max(0, 100 - section_penalty)
                section['current_points'] = section_score
                section['percentage'] = section_score

                # Update section status
                if section_score >= 80:
                    section['status'] = 'Strong'
                elif section_score >= 60:
                    section['status'] = 'Good'
                else:
                    section['status'] = 'NeedsWork'

            user.analysis_result = analysis_data
            await db.commit()
            await db.refresh(user)
            return user.analysis_result

        return None

    async def change_password(self, db: AsyncSession, *, user_id: int, current_password: str, new_password: str) -> Optional[User]:
        """
        Change user password after verifying current password.
        Returns user if successful, None if current password is incorrect.
        """
        user = await self.get(db, id=user_id)
        if not user:
            return None
        if not user.password_hash:
            return None
        
        # Verify current password
        if not verify_password(current_password, user.password_hash):
            return None
        
        # Set new password
        user.password_hash = get_password_hash(new_password)
        await db.commit()
        await db.refresh(user)
        return user

    async def delete_account(self, db: AsyncSession, *, user_id: int, password: str) -> Optional[User]:
        """
        Delete/anonymize user account after verifying password.
        Anonymizes email and clears sensitive data but keeps record for analytics.
        Returns user if successful, None if password is incorrect.
        """
        user = await self.get(db, id=user_id)
        if not user:
            return None
        if not user.password_hash:
            return None
        
        # Verify password
        if not verify_password(password, user.password_hash):
            return None
        
        # Anonymize user data
        user.email = f"deleted_user_{user.id}@anonymous.local"
        user.password_hash = get_password_hash("DELETED_ACCOUNT")
        user.auth_provider = "deleted"
        user.google_sub = None
        user.first_name = None
        user.last_name = None
        user.is_verified = False
        user.is_registered = False
        user.verification_token = None
        user.verification_code = None
        user.password_reset_token = None
        user.password_reset_code = None
        user.resume_data = {}
        user.onboarding_responses = None
        
        await db.commit()
        await db.refresh(user)
        return user


user_crud = CRUDUser(User)
