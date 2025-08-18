from typing import List, Optional
from uuid import UUID

from app.database.crud.base import CRUDBase
from app.database.models import Resume, ResumePersonalInfo, ResumeSkill, ResumeExperience, ResumeEducation, ResumeExport
from app.schemas.resume import (
    ResumeCreate, ResumeUpdate, ResumePartialUpdate,
    ResumePersonalInfoCreate, ResumePersonalInfoUpdate,
    ResumeSkillCreate, ResumeSkillUpdate,
    ResumeExperienceCreate, ResumeExperienceUpdate,
    ResumeEducationCreate, ResumeEducationUpdate,
    ResumeExportCreate, ResumeExportUpdate
)
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession


class CRUDResume(CRUDBase[Resume, ResumeCreate, ResumeUpdate]):
    async def get_by_user_id(self, db: AsyncSession, *, user_id: UUID) -> List[Resume]:
        result = await db.execute(select(self.model).where(Resume.user_id == user_id))
        return result.scalars().all()

    async def get_by_user_id_and_id(self, db: AsyncSession, *, user_id: UUID, resume_id: UUID) -> Optional[Resume]:
        result = await db.execute(
            select(self.model).where(Resume.user_id == user_id, Resume.id == resume_id)
        )
        return result.scalar_one_or_none()

    async def get_by_template_id(self, db: AsyncSession, *, template_id: UUID) -> List[Resume]:
        result = await db.execute(select(self.model).where(Resume.template_id == template_id))
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: ResumeCreate, user_id: UUID) -> Resume:
        """Create a new resume with user_id."""
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


class CRUDResumePersonalInfo(CRUDBase[ResumePersonalInfo, ResumePersonalInfoCreate, ResumePersonalInfoUpdate]):
    async def get_by_resume_id(self, db: AsyncSession, *, resume_id: UUID) -> Optional[ResumePersonalInfo]:
        result = await db.execute(select(self.model).where(ResumePersonalInfo.resume_id == resume_id))
        return result.scalar_one_or_none()


class CRUDResumeSkill(CRUDBase[ResumeSkill, ResumeSkillCreate, ResumeSkillUpdate]):
    async def get_by_resume_id(self, db: AsyncSession, *, resume_id: UUID) -> List[ResumeSkill]:
        result = await db.execute(
            select(self.model).where(ResumeSkill.resume_id == resume_id).order_by(ResumeSkill.order_index)
        )
        return result.scalars().all()

    async def update_order(self, db: AsyncSession, *, skill_ids: List[UUID]) -> None:
        for index, skill_id in enumerate(skill_ids):
            await db.execute(
                update(ResumeSkill).where(ResumeSkill.id == skill_id).values(order_index=index)
            )
        await db.commit()


class CRUDResumeExperience(CRUDBase[ResumeExperience, ResumeExperienceCreate, ResumeExperienceUpdate]):
    async def get_by_resume_id(self, db: AsyncSession, *, resume_id: UUID) -> List[ResumeExperience]:
        result = await db.execute(
            select(self.model).where(ResumeExperience.resume_id == resume_id).order_by(ResumeExperience.order_index)
        )
        return result.scalars().all()

    async def update_order(self, db: AsyncSession, *, experience_ids: List[UUID]) -> None:
        for index, experience_id in enumerate(experience_ids):
            await db.execute(
                update(ResumeExperience).where(ResumeExperience.id == experience_id).values(order_index=index)
            )
        await db.commit()


class CRUDResumeEducation(CRUDBase[ResumeEducation, ResumeEducationCreate, ResumeEducationUpdate]):
    async def get_by_resume_id(self, db: AsyncSession, *, resume_id: UUID) -> List[ResumeEducation]:
        result = await db.execute(
            select(self.model).where(ResumeEducation.resume_id == resume_id).order_by(ResumeEducation.order_index)
        )
        return result.scalars().all()

    async def update_order(self, db: AsyncSession, *, education_ids: List[UUID]) -> None:
        for index, education_id in enumerate(education_ids):
            await db.execute(
                update(ResumeEducation).where(ResumeEducation.id == education_id).values(order_index=index)
            )
        await db.commit()


class CRUDResumeExport(CRUDBase[ResumeExport, ResumeExportCreate, ResumeExportUpdate]):
    async def get_by_resume_id(self, db: AsyncSession, *, resume_id: UUID) -> List[ResumeExport]:
        result = await db.execute(
            select(self.model).where(ResumeExport.resume_id == resume_id).order_by(ResumeExport.exported_at.desc())
        )
        return result.scalars().all()


class ResumeManager:
    """High-level manager for resume operations"""
    
    def __init__(self):
        self.resume_crud = CRUDResume(Resume)
        self.personal_info_crud = CRUDResumePersonalInfo(ResumePersonalInfo)
        self.skill_crud = CRUDResumeSkill(ResumeSkill)
        self.experience_crud = CRUDResumeExperience(ResumeExperience)
        self.education_crud = CRUDResumeEducation(ResumeEducation)
        self.export_crud = CRUDResumeExport(ResumeExport)

    # Personal Info methods
    async def update_personal_info(self, db: AsyncSession, *, resume_id: UUID, personal_info: ResumePersonalInfoUpdate) -> Optional[ResumePersonalInfo]:
        existing = await self.personal_info_crud.get_by_resume_id(db, resume_id=resume_id)
        if existing:
            return await self.personal_info_crud.update(db, db_obj=existing, obj_in=personal_info)
        else:
            # Create new personal info
            create_dict = personal_info.model_dump(exclude_unset=True)
            create_dict['resume_id'] = resume_id
            create_data = ResumePersonalInfoCreate(**create_dict)
            return await self.personal_info_crud.create(db, obj_in=create_data)

    # Skill methods
    async def add_skill(self, db: AsyncSession, *, resume_id: UUID, skill_name: str) -> ResumeSkill:
        # Get max order_index
        skills = await self.skill_crud.get_by_resume_id(db, resume_id=resume_id)
        max_order = max([skill.order_index for skill in skills]) if skills else -1
        
        skill_dict = {
            'name': skill_name,
            'resume_id': resume_id,
            'order_index': max_order + 1
        }
        skill_data = ResumeSkillCreate(**skill_dict)
        return await self.skill_crud.create(db, obj_in=skill_data)

    async def remove_skill(self, db: AsyncSession, *, resume_id: UUID, skill_id: UUID) -> bool:
        skill = await self.skill_crud.get(db, id=skill_id)
        if skill and skill.resume_id == resume_id:
            await self.skill_crud.remove(db, id=skill_id)
            return True
        return False

    async def update_skill_order(self, db: AsyncSession, *, resume_id: UUID, skill_ids: List[UUID]) -> None:
        # Verify all skills belong to the resume
        skills = await self.skill_crud.get_by_resume_id(db, resume_id=resume_id)
        skill_ids_set = {skill.id for skill in skills}
        if not all(skill_id in skill_ids_set for skill_id in skill_ids):
            raise ValueError("Some skill IDs do not belong to this resume")
        
        await self.skill_crud.update_order(db, skill_ids=skill_ids)

    # Experience methods
    async def add_experience(self, db: AsyncSession, *, resume_id: UUID, experience_data: ResumeExperienceCreate) -> ResumeExperience:
        # Get max order_index
        experiences = await self.experience_crud.get_by_resume_id(db, resume_id=resume_id)
        max_order = max([exp.order_index for exp in experiences]) if experiences else -1
        
        # Create new experience data with resume_id and order_index
        experience_dict = experience_data.model_dump()
        experience_dict['resume_id'] = resume_id
        experience_dict['order_index'] = max_order + 1
        new_experience_data = ResumeExperienceCreate(**experience_dict)
        return await self.experience_crud.create(db, obj_in=new_experience_data)

    async def update_experience(self, db: AsyncSession, *, resume_id: UUID, experience_id: UUID, experience_data: ResumeExperienceUpdate) -> Optional[ResumeExperience]:
        experience = await self.experience_crud.get(db, id=experience_id)
        if experience and experience.resume_id == resume_id:
            return await self.experience_crud.update(db, db_obj=experience, obj_in=experience_data)
        return None

    async def remove_experience(self, db: AsyncSession, *, resume_id: UUID, experience_id: UUID) -> bool:
        experience = await self.experience_crud.get(db, id=experience_id)
        if experience and experience.resume_id == resume_id:
            await self.experience_crud.remove(db, id=experience_id)
            return True
        return False

    async def update_experience_order(self, db: AsyncSession, *, resume_id: UUID, experience_ids: List[UUID]) -> None:
        # Verify all experiences belong to the resume
        experiences = await self.experience_crud.get_by_resume_id(db, resume_id=resume_id)
        experience_ids_set = {exp.id for exp in experiences}
        if not all(exp_id in experience_ids_set for exp_id in experience_ids):
            raise ValueError("Some experience IDs do not belong to this resume")
        
        await self.experience_crud.update_order(db, experience_ids=experience_ids)

    # Education methods
    async def add_education(self, db: AsyncSession, *, resume_id: UUID, education_data: ResumeEducationCreate) -> ResumeEducation:
        # Get max order_index
        educations = await self.education_crud.get_by_resume_id(db, resume_id=resume_id)
        max_order = max([edu.order_index for edu in educations]) if educations else -1
        
        # Create new education data with resume_id and order_index
        education_dict = education_data.model_dump()
        education_dict['resume_id'] = resume_id
        education_dict['order_index'] = max_order + 1
        new_education_data = ResumeEducationCreate(**education_dict)
        return await self.education_crud.create(db, obj_in=new_education_data)

    async def update_education(self, db: AsyncSession, *, resume_id: UUID, education_id: UUID, education_data: ResumeEducationUpdate) -> Optional[ResumeEducation]:
        education = await self.education_crud.get(db, id=education_id)
        if education and education.resume_id == resume_id:
            return await self.education_crud.update(db, db_obj=education, obj_in=education_data)
        return None

    async def remove_education(self, db: AsyncSession, *, resume_id: UUID, education_id: UUID) -> bool:
        education = await self.education_crud.get(db, id=education_id)
        if education and education.resume_id == resume_id:
            await self.education_crud.remove(db, id=education_id)
            return True
        return False

    async def update_education_order(self, db: AsyncSession, *, resume_id: UUID, education_ids: List[UUID]) -> None:
        # Verify all educations belong to the resume
        educations = await self.education_crud.get_by_resume_id(db, resume_id=resume_id)
        education_ids_set = {edu.id for edu in educations}
        if not all(edu_id in education_ids_set for edu_id in education_ids):
            raise ValueError("Some education IDs do not belong to this resume")
        
        await self.education_crud.update_order(db, education_ids=education_ids)

    # Export methods
    async def add_export_record(self, db: AsyncSession, *, resume_id: UUID, export_format: str, file_size: Optional[int] = None, export_settings: Optional[dict] = None) -> ResumeExport:
        export_dict = {
            'resume_id': resume_id,
            'export_format': export_format,
            'file_size': file_size,
            'export_settings': export_settings
        }
        export_data = ResumeExportCreate(**export_dict)
        return await self.export_crud.create(db, obj_in=export_data)

    async def get_export_history(self, db: AsyncSession, *, resume_id: UUID) -> List[ResumeExport]:
        return await self.export_crud.get_by_resume_id(db, resume_id=resume_id)


# Create instances
resume_crud = CRUDResume(Resume)
resume_manager = ResumeManager()
