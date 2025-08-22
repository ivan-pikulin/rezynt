from typing import List, Optional

from app.database.crud.base import CRUDBase
from app.database.models import Resume, ResumePersonalInfo, ResumeContact, ResumeSkill, ResumeExperience, ResumeEducation, ResumeExport
from app.schemas.resume import (
    ResumeCreate, ResumeUpdate, ResumePartialUpdate,
    ResumePersonalInfoCreate, ResumePersonalInfoUpdate,
    ResumeContactCreate, ResumeContactUpdate,
    ResumeSkillCreate, ResumeSkillUpdate,
    ResumeExperienceCreate, ResumeExperienceUpdate,
    ResumeEducationCreate, ResumeEducationUpdate,
    ResumeExportCreate, ResumeExportUpdate,
    UnifiedResume, UnifiedResumeExperience, UnifiedResumeEducation
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class CRUDResume(CRUDBase[Resume, ResumeCreate, ResumeUpdate]):
    async def get_by_user_id(self, db: AsyncSession, *, user_id: int) -> List[UnifiedResume]:
        """Get all resumes for a user as unified objects"""
        result = await db.execute(select(self.model).where(Resume.user_id == user_id))
        resumes = result.scalars().all()
        return [await self._to_unified_resume(db, resume) for resume in resumes]

    async def get_all_full_resumes_by_user_id(self, db: AsyncSession, *, user_id: int) -> List[UnifiedResume]:
        """
        Get all resumes for a user with all related data as unified objects.
        Uses eager loading to avoid N+1 queries.
        """
        from sqlalchemy.orm import selectinload
        
        result = await db.execute(
            select(self.model)
            .options(
                selectinload(Resume.personal_info),
                selectinload(Resume.contacts),
                selectinload(Resume.skills),
                selectinload(Resume.experience),
                selectinload(Resume.education),
                selectinload(Resume.template)
            )
            .where(Resume.user_id == user_id)
        )
        resumes = result.scalars().all()
        return [await self._to_unified_resume(db, resume) for resume in resumes]

    async def get_by_user_id_and_id(self, db: AsyncSession, *, user_id: int, resume_id: int) -> Optional[UnifiedResume]:
        """Get a specific resume by user_id and resume_id as unified object"""
        result = await db.execute(
            select(self.model).where(Resume.user_id == user_id, Resume.id == resume_id)
        )
        resume = result.scalar_one_or_none()
        if resume:
            return await self._to_unified_resume(db, resume)
        return None

    async def get_by_template_id(self, db: AsyncSession, *, template_id: int) -> List[UnifiedResume]:
        """Get all resumes by template_id as unified objects"""
        result = await db.execute(select(self.model).where(Resume.template_id == template_id))
        resumes = result.scalars().all()
        return [await self._to_unified_resume(db, resume) for resume in resumes]

    async def create(self, db: AsyncSession, *, obj_in: ResumeCreate, user_id: int) -> UnifiedResume:
        """Create a new resume with user_id and return as unified object"""
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return await self._to_unified_resume(db, db_obj)

    async def update(self, db: AsyncSession, *, db_obj: Resume, obj_in: ResumeUpdate) -> UnifiedResume:
        """Update a resume and return as unified object"""
        # Update the database model
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        await db.commit()
        await db.refresh(db_obj)
        return await self._to_unified_resume(db, db_obj)

    async def get_full_resume(self, db: AsyncSession, *, user_id: int, resume_id: int) -> Optional[UnifiedResume]:
        """
        Get a complete resume with all related data as unified object.
        Uses eager loading to avoid N+1 queries.
        """
        from sqlalchemy.orm import selectinload
        
        result = await db.execute(
            select(self.model)
            .options(
                selectinload(Resume.personal_info),
                selectinload(Resume.contacts),
                selectinload(Resume.skills),
                selectinload(Resume.experience),
                selectinload(Resume.education),
                selectinload(Resume.template)
            )
            .where(Resume.user_id == user_id, Resume.id == resume_id)
        )
        resume = result.scalar_one_or_none()
        if resume:
            return await self._to_unified_resume(db, resume)
        return None

    async def get_full_resume_with_exports(self, db: AsyncSession, *, user_id: int, resume_id: int) -> Optional[UnifiedResume]:
        """
        Get a complete resume with all related data including exports as unified object.
        Uses eager loading to avoid N+1 queries.
        """
        from sqlalchemy.orm import selectinload
        
        result = await db.execute(
            select(self.model)
            .options(
                selectinload(Resume.personal_info),
                selectinload(Resume.contacts),
                selectinload(Resume.skills),
                selectinload(Resume.experience),
                selectinload(Resume.education),
                selectinload(Resume.template),
                selectinload(Resume.exports)
            )
            .where(Resume.user_id == user_id, Resume.id == resume_id)
        )
        resume = result.scalar_one_or_none()
        if resume:
            return await self._to_unified_resume(db, resume)
        return None

    async def _to_unified_resume(self, db: AsyncSession, resume: Resume) -> UnifiedResume:
        """Convert database resume to unified resume object"""
        # Load related data if not already loaded
        if not resume.personal_info:
            await db.refresh(resume, ['personal_info'])
        if not resume.contacts:
            await db.refresh(resume, ['contacts'])
        if not resume.skills:
            await db.refresh(resume, ['skills'])
        if not resume.experience:
            await db.refresh(resume, ['experience'])
        if not resume.education:
            await db.refresh(resume, ['education'])

        # Extract personal info
        first_name = None
        last_name = None
        location = None
        if resume.personal_info:
            first_name = resume.personal_info.first_name
            last_name = resume.personal_info.last_name
            location = resume.personal_info.location

        # Extract contacts
        contacts = [contact.value for contact in resume.contacts] if resume.contacts else []

        # Extract skills
        skills = [skill.name for skill in resume.skills] if resume.skills else []

        # Extract experience
        experience = []
        if resume.experience:
            for exp in resume.experience:
                experience.append(UnifiedResumeExperience(
                    job_title=exp.job_title,
                    company=exp.company,
                    location=exp.location,
                    start_date=exp.start_date,
                    end_date=exp.end_date,
                    responsibilities=exp.responsibilities or []
                ))

        # Extract education
        education = []
        if resume.education:
            for edu in resume.education:
                education.append(UnifiedResumeEducation(
                    degree=edu.degree,
                    institution=edu.institution,
                    location=edu.location,
                    graduation_date=edu.graduation_date
                ))

        return UnifiedResume(
            id=resume.id,
            user_id=resume.user_id,
            title=resume.title,
            template_id=resume.template_id,
            professional_summary=resume.professional_summary,
            conversation_id=resume.conversation_id,
            created_at=resume.created_at,
            updated_at=resume.updated_at,
            first_name=first_name,
            last_name=last_name,
            location=location,
            contacts=contacts,
            skills=skills,
            experience=experience,
            education=education
        )


class CRUDResumePersonalInfo(CRUDBase[ResumePersonalInfo, ResumePersonalInfoCreate, ResumePersonalInfoUpdate]):
    async def get_by_resume_id(self, db: AsyncSession, *, resume_id: int) -> Optional[ResumePersonalInfo]:
        result = await db.execute(select(self.model).where(ResumePersonalInfo.resume_id == resume_id))
        return result.scalar_one_or_none()


class CRUDResumeContact(CRUDBase[ResumeContact, ResumeContactCreate, ResumeContactUpdate]):
    async def get_by_resume_id(self, db: AsyncSession, *, resume_id: int) -> List[ResumeContact]:
        result = await db.execute(
            select(self.model).where(ResumeContact.resume_id == resume_id).order_by(ResumeContact.id)
        )
        return result.scalars().all()


class CRUDResumeSkill(CRUDBase[ResumeSkill, ResumeSkillCreate, ResumeSkillUpdate]):
    async def get_by_resume_id(self, db: AsyncSession, *, resume_id: int) -> List[ResumeSkill]:
        result = await db.execute(
            select(self.model).where(ResumeSkill.resume_id == resume_id).order_by(ResumeSkill.id)
        )
        return result.scalars().all()


class CRUDResumeExperience(CRUDBase[ResumeExperience, ResumeExperienceCreate, ResumeExperienceUpdate]):
    async def get_by_resume_id(self, db: AsyncSession, *, resume_id: int) -> List[ResumeExperience]:
        result = await db.execute(
            select(self.model).where(ResumeExperience.resume_id == resume_id).order_by(ResumeExperience.id)
        )
        return result.scalars().all()


class CRUDResumeEducation(CRUDBase[ResumeEducation, ResumeEducationCreate, ResumeEducationUpdate]):
    async def get_by_resume_id(self, db: AsyncSession, *, resume_id: int) -> List[ResumeEducation]:
        result = await db.execute(
            select(self.model).where(ResumeEducation.resume_id == resume_id).order_by(ResumeEducation.id)
        )
        return result.scalars().all()


class CRUDResumeExport(CRUDBase[ResumeExport, ResumeExportCreate, ResumeExportUpdate]):
    async def get_by_resume_id(self, db: AsyncSession, *, resume_id: int) -> List[ResumeExport]:
        result = await db.execute(
            select(self.model).where(ResumeExport.resume_id == resume_id).order_by(ResumeExport.exported_at.desc())
        )
        return result.scalars().all()


class ResumeManager:
    """High-level manager for resume operations"""
    
    def __init__(self):
        self.resume_crud = CRUDResume(Resume)
        self.personal_info_crud = CRUDResumePersonalInfo(ResumePersonalInfo)
        self.contact_crud = CRUDResumeContact(ResumeContact)
        self.skill_crud = CRUDResumeSkill(ResumeSkill)
        self.experience_crud = CRUDResumeExperience(ResumeExperience)
        self.education_crud = CRUDResumeEducation(ResumeEducation)
        self.export_crud = CRUDResumeExport(ResumeExport)

    # Main resume operations
    async def get_all_resumes(self, db: AsyncSession, *, user_id: int) -> List[UnifiedResume]:
        """Get all resumes for a user as unified objects"""
        return await self.resume_crud.get_by_user_id(db, user_id=user_id)

    async def get_resume(self, db: AsyncSession, *, user_id: int, resume_id: int) -> Optional[UnifiedResume]:
        """Get a specific resume by user_id and resume_id as unified object"""
        return await self.resume_crud.get_by_user_id_and_id(db, user_id=user_id, resume_id=resume_id)

    async def create_resume(self, db: AsyncSession, *, obj_in: ResumeCreate, user_id: int) -> UnifiedResume:
        """Create a new resume with user_id and return as unified object"""
        return await self.resume_crud.create(db, obj_in=obj_in, user_id=user_id)

    async def update_resume(self, db: AsyncSession, *, resume_id: int, resume_update: ResumeUpdate) -> UnifiedResume:
        """Update a resume and return as unified object"""
        # Get the database model for update
        db_resume = await self.resume_crud.get(db, id=resume_id)
        if not db_resume:
            raise ValueError("Resume not found")
        
        return await self.resume_crud.update(db, db_obj=db_resume, obj_in=resume_update)

    async def get_full_resume(self, db: AsyncSession, *, user_id: int, resume_id: int) -> Optional[UnifiedResume]:
        """Get a complete resume with all related data as unified object"""
        return await self.resume_crud.get_full_resume(db, user_id=user_id, resume_id=resume_id)

    # Personal Info methods
    async def get_personal_info(self, db: AsyncSession, *, resume_id: int) -> Optional[ResumePersonalInfo]:
        """Get personal info for a resume."""
        return await self.personal_info_crud.get_by_resume_id(db, resume_id=resume_id)

    async def update_personal_info(self, db: AsyncSession, *, resume_id: int, personal_info: ResumePersonalInfoUpdate) -> Optional[ResumePersonalInfo]:
        existing = await self.personal_info_crud.get_by_resume_id(db, resume_id=resume_id)
        if existing:
            return await self.personal_info_crud.update(db, db_obj=existing, obj_in=personal_info)
        else:
            # Create new personal info
            create_dict = personal_info.model_dump(exclude_unset=True)
            create_dict['resume_id'] = resume_id
            create_data = ResumePersonalInfoCreate(**create_dict)
            return await self.personal_info_crud.create(db, obj_in=create_data)

    # Contact methods
    async def get_contacts(self, db: AsyncSession, *, resume_id: int) -> List[ResumeContact]:
        """Get contacts for a resume."""
        return await self.contact_crud.get_by_resume_id(db, resume_id=resume_id)

    async def add_contact(self, db: AsyncSession, *, resume_id: int, contact_value: str) -> ResumeContact:
        contact_dict = {
            'value': contact_value,
            'resume_id': resume_id
        }
        contact_data = ResumeContactCreate(**contact_dict)
        return await self.contact_crud.create(db, obj_in=contact_data)

    async def update_contact(self, db: AsyncSession, *, resume_id: int, contact_id: int, contact_data: ResumeContactUpdate) -> Optional[ResumeContact]:
        contact = await self.contact_crud.get(db, id=contact_id)
        if contact and contact.resume_id == resume_id:
            return await self.contact_crud.update(db, db_obj=contact, obj_in=contact_data)
        return None

    async def remove_contact(self, db: AsyncSession, *, resume_id: int, contact_id: int) -> bool:
        contact = await self.contact_crud.get(db, id=contact_id)
        if contact and contact.resume_id == resume_id:
            removed_contact = await self.contact_crud.remove(db, id=contact_id)
            return removed_contact is not None
        return False

    # Skill methods
    async def get_skills(self, db: AsyncSession, *, resume_id: int) -> List[ResumeSkill]:
        """Get skills for a resume."""
        return await self.skill_crud.get_by_resume_id(db, resume_id=resume_id)

    async def add_skill(self, db: AsyncSession, *, resume_id: int, skill_name: str) -> ResumeSkill:
        skill_dict = {
            'name': skill_name,
            'resume_id': resume_id
        }
        skill_data = ResumeSkillCreate(**skill_dict)
        return await self.skill_crud.create(db, obj_in=skill_data)

    async def remove_skill(self, db: AsyncSession, *, resume_id: int, skill_id: int) -> bool:
        skill = await self.skill_crud.get(db, id=skill_id)
        if skill and skill.resume_id == resume_id:
            removed_skill = await self.skill_crud.remove(db, id=skill_id)
            return removed_skill is not None
        return False

    # Experience methods
    async def get_experience(self, db: AsyncSession, *, resume_id: int) -> List[ResumeExperience]:
        """Get experience for a resume."""
        return await self.experience_crud.get_by_resume_id(db, resume_id=resume_id)

    async def add_experience(self, db: AsyncSession, *, resume_id: int, experience_data: ResumeExperienceCreate) -> ResumeExperience:
        # Create new experience data with resume_id
        experience_dict = experience_data.model_dump()
        experience_dict['resume_id'] = resume_id
        new_experience_data = ResumeExperienceCreate(**experience_dict)
        return await self.experience_crud.create(db, obj_in=new_experience_data)

    async def update_experience(self, db: AsyncSession, *, resume_id: int, experience_id: int, experience_data: ResumeExperienceUpdate) -> Optional[ResumeExperience]:
        experience = await self.experience_crud.get(db, id=experience_id)
        if experience and experience.resume_id == resume_id:
            return await self.experience_crud.update(db, db_obj=experience, obj_in=experience_data)
        return None

    async def remove_experience(self, db: AsyncSession, *, resume_id: int, experience_id: int) -> bool:
        experience = await self.experience_crud.get(db, id=experience_id)
        if experience and experience.resume_id == resume_id:
            removed_experience = await self.experience_crud.remove(db, id=experience_id)
            return removed_experience is not None
        return False

    # Education methods
    async def get_education(self, db: AsyncSession, *, resume_id: int) -> List[ResumeEducation]:
        """Get education for a resume."""
        return await self.education_crud.get_by_resume_id(db, resume_id=resume_id)

    async def add_education(self, db: AsyncSession, *, resume_id: int, education_data: ResumeEducationCreate) -> ResumeEducation:
        # Create new education data with resume_id
        education_dict = education_data.model_dump()
        education_dict['resume_id'] = resume_id
        new_education_data = ResumeEducationCreate(**education_dict)
        return await self.education_crud.create(db, obj_in=new_education_data)

    async def update_education(self, db: AsyncSession, *, resume_id: int, education_id: int, education_data: ResumeEducationUpdate) -> Optional[ResumeEducation]:
        education = await self.education_crud.get(db, id=education_id)
        if education and education.resume_id == resume_id:
            return await self.education_crud.update(db, db_obj=education, obj_in=education_data)
        return None

    async def remove_education(self, db: AsyncSession, *, resume_id: int, education_id: int) -> bool:
        education = await self.education_crud.get(db, id=education_id)
        if education and education.resume_id == resume_id:
            removed_education = await self.education_crud.remove(db, id=education_id)
            return removed_education is not None
        return False

    # Export methods
    async def add_export_record(self, db: AsyncSession, *, resume_id: int, export_format: str, file_size: Optional[int] = None, export_settings: Optional[dict] = None) -> ResumeExport:
        export_dict = {
            'resume_id': resume_id,
            'export_format': export_format,
            'file_size': file_size,
            'export_settings': export_settings
        }
        export_data = ResumeExportCreate(**export_dict)
        return await self.export_crud.create(db, obj_in=export_data)

    async def get_export_history(self, db: AsyncSession, *, resume_id: int) -> List[ResumeExport]:
        return await self.export_crud.get_by_resume_id(db, resume_id=resume_id)


# Create instances
resume_crud = CRUDResume(Resume)
resume_manager = ResumeManager()
