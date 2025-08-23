from typing import List, Optional, Dict, Any
from datetime import datetime

from app.database.crud.base import CRUDBase
from app.database.models import (Resume, ResumeContact, ResumeEducation,
                                 ResumeExperience, ResumeExport,
                                 ResumePersonalInfo, ResumeSkill)
from app.schemas.resume import (ResumeContactCreate, ResumeContactUpdate,
                                ResumeCreate, ResumeEducationCreate,
                                ResumeEducationUpdate, ResumeExperienceCreate,
                                ResumeExperienceUpdate, ResumeExportCreate,
                                ResumeExportUpdate, ResumePersonalInfoCreate,
                                ResumePersonalInfoUpdate, ResumeSkillCreate,
                                ResumeSkillUpdate, ResumeUpdate, ResumePartialUpdate, UnifiedResume,
                                UnifiedResumeEducation,
                                UnifiedResumeExperience)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class CRUDResume(CRUDBase[Resume, ResumeCreate, ResumeUpdate]):
    async def get_by_user_id(self, db: AsyncSession, *, user_id: int) -> List[UnifiedResume]:
        """Get all resumes for a user as unified objects"""
        from sqlalchemy.orm import selectinload
        
        result = await db.execute(
            select(self.model)
            .options(
                selectinload(Resume.personal_info),
                selectinload(Resume.contacts),
                selectinload(Resume.skills),
                selectinload(Resume.experience),
                selectinload(Resume.education)
            )
            .where(Resume.user_id == user_id)
        )
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
        from sqlalchemy.orm import selectinload
        
        result = await db.execute(
            select(self.model)
            .options(
                selectinload(Resume.personal_info),
                selectinload(Resume.contacts),
                selectinload(Resume.skills),
                selectinload(Resume.experience),
                selectinload(Resume.education)
            )
            .where(Resume.user_id == user_id, Resume.id == resume_id)
        )
        resume = result.scalar_one_or_none()
        if resume:
            return await self._to_unified_resume(db, resume)
        return None

    async def get_by_template_id(self, db: AsyncSession, *, template_id: int) -> List[UnifiedResume]:
        """Get all resumes by template_id as unified objects"""
        from sqlalchemy.orm import selectinload
        
        result = await db.execute(
            select(self.model)
            .options(
                selectinload(Resume.personal_info),
                selectinload(Resume.contacts),
                selectinload(Resume.skills),
                selectinload(Resume.experience),
                selectinload(Resume.education)
            )
            .where(Resume.template_id == template_id)
        )
        resumes = result.scalars().all()
        return [await self._to_unified_resume(db, resume) for resume in resumes]

    async def get_by_id(self, db: AsyncSession, *, resume_id: int) -> Optional[UnifiedResume]:
        """Get a specific resume by ID as unified object"""
        from sqlalchemy.orm import selectinload
        
        result = await db.execute(
            select(self.model)
            .options(
                selectinload(Resume.personal_info),
                selectinload(Resume.contacts),
                selectinload(Resume.skills),
                selectinload(Resume.experience),
                selectinload(Resume.education)
            )
            .where(Resume.id == resume_id)
        )
        resume = result.scalar_one_or_none()
        if resume:
            return await self._to_unified_resume(db, resume)
        return None

    async def get_db_model_by_id(self, db: AsyncSession, *, resume_id: int) -> Optional[Resume]:
        """Get a specific resume by ID as database model with relationships loaded"""
        from sqlalchemy.orm import selectinload
        
        result = await db.execute(
            select(self.model)
            .options(
                selectinload(Resume.personal_info),
                selectinload(Resume.contacts),
                selectinload(Resume.skills),
                selectinload(Resume.experience),
                selectinload(Resume.education)
            )
            .where(Resume.id == resume_id)
        )
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, *, obj_in: ResumeCreate, user_id: int) -> UnifiedResume:
        """Create a new resume with user_id and return as unified object"""
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        await db.commit()
        # Refresh the entire object to ensure all fields are loaded
        await db.refresh(db_obj)
        return await self._to_unified_resume(db, db_obj)

    async def update(self, db: AsyncSession, *, db_obj: Resume, obj_in: ResumeUpdate) -> UnifiedResume:
        """Update a resume and return as unified object"""
        # Update the database model
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        await db.commit()
        # Refresh the entire object to ensure all fields are loaded
        await db.refresh(db_obj)
        return await self._to_unified_resume(db, db_obj)

    async def partial_update_resume(self, db: AsyncSession, *, resume_id: int, resume_update: ResumePartialUpdate) -> UnifiedResume:
        """Partially update a resume with support for UnifiedResume fields"""
        # Get the resume
        resume = await self.get(db, id=resume_id)
        if not resume:
            raise ValueError("Resume not found")
        
        update_data = resume_update.model_dump(exclude_unset=True)
        
        # Handle basic resume fields
        basic_fields = ['title', 'template_id', 'professional_summary', 'conversation_id']
        for field in basic_fields:
            if field in update_data:
                setattr(resume, field, update_data[field])
        
        # Handle personal info fields
        personal_info_fields = ['first_name', 'last_name', 'location']
        personal_info_data = {}
        for field in personal_info_fields:
            if field in update_data:
                personal_info_data[field] = update_data[field]
        
        if personal_info_data:
            await self.update_personal_info(db, resume_id=resume_id, personal_info=ResumePersonalInfoUpdate(**personal_info_data))
        
        # Handle contacts
        if 'contacts' in update_data:
            await self.update_contacts(db, resume_id=resume_id, contacts=update_data['contacts'])
        
        # Handle skills
        if 'skills' in update_data:
            await self.update_skills(db, resume_id=resume_id, skills=update_data['skills'])
        
        # Handle experience
        if 'experience' in update_data:
            await self.update_experience_list(db, resume_id=resume_id, experience_list=update_data['experience'])
        
        # Handle education
        if 'education' in update_data:
            await self.update_education_list(db, resume_id=resume_id, education_list=update_data['education'])
        
        await db.commit()
        await db.refresh(resume)
        
        return await self._to_unified_resume(db, resume)

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
        # For a newly created resume, related data will be empty, so we don't need to load it
        # Extract personal info
        first_name = None
        last_name = None
        location = None
        if hasattr(resume, 'personal_info') and resume.personal_info:
            first_name = resume.personal_info.first_name
            last_name = resume.personal_info.last_name
            location = resume.personal_info.location

        # Extract contacts
        contacts = []
        if hasattr(resume, 'contacts') and resume.contacts:
            contacts = [contact.value for contact in resume.contacts]

        # Extract skills
        skills = []
        if hasattr(resume, 'skills') and resume.skills:
            skills = [skill.name for skill in resume.skills]

        # Extract experience
        experience = []
        if hasattr(resume, 'experience') and resume.experience:
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
        if hasattr(resume, 'education') and resume.education:
            for edu in resume.education:
                education.append(UnifiedResumeEducation(
                    degree=edu.degree,
                    institution=edu.institution,
                    location=edu.location,
                    graduation_date=edu.graduation_date
                ))

        return UnifiedResume(
            id=getattr(resume, 'id', None),
            user_id=getattr(resume, 'user_id', None),
            title=getattr(resume, 'title', None),
            template_id=getattr(resume, 'template_id', None),
            professional_summary=getattr(resume, 'professional_summary', None),
            conversation_id=getattr(resume, 'conversation_id', None),
            created_at=getattr(resume, 'created_at', None),
            updated_at=getattr(resume, 'updated_at', None),
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

    async def get_resume_by_id(self, db: AsyncSession, *, resume_id: int) -> Optional[UnifiedResume]:
        """Get a specific resume by ID without user_id check (for AI operations)"""
        return await self.resume_crud.get_by_id(db, resume_id=resume_id)

    async def create_resume(self, db: AsyncSession, *, obj_in: ResumeCreate, user_id: int) -> UnifiedResume:
        """Create a new resume with user_id and return as unified object"""
        return await self.resume_crud.create(db, obj_in=obj_in, user_id=user_id)

    async def update_resume(self, db: AsyncSession, *, resume_id: int, resume_update: ResumeUpdate) -> UnifiedResume:
        """Update a resume and return as unified object"""
        # Get the database model for update with relationships loaded
        db_resume = await self.resume_crud.get_db_model_by_id(db, resume_id=resume_id)
        if not db_resume:
            raise ValueError("Resume not found")
        
        return await self.resume_crud.update(db, db_obj=db_resume, obj_in=resume_update)

    async def partial_update_resume(self, db: AsyncSession, *, resume_id: int, resume_update: ResumePartialUpdate) -> UnifiedResume:
        """Partially update a resume with flexible field updates"""
        # Get the current resume
        current_resume = await self.get_resume_by_id(db, resume_id=resume_id)
        if not current_resume:
            raise ValueError("Resume not found")
        
        # Update basic resume fields
        if any([resume_update.title is not None, resume_update.template_id is not None, 
                resume_update.professional_summary is not None, resume_update.conversation_id is not None]):
            basic_update = ResumeUpdate(
                title=resume_update.title,
                template_id=resume_update.template_id,
                professional_summary=resume_update.professional_summary,
                conversation_id=resume_update.conversation_id
            )
            await self.update_resume(db, resume_id=resume_id, resume_update=basic_update)
        
        # Update personal info
        if any([resume_update.first_name is not None, resume_update.last_name is not None, 
                resume_update.location is not None]):
            personal_info_update = ResumePersonalInfoUpdate(
                first_name=resume_update.first_name,
                last_name=resume_update.last_name,
                location=resume_update.location
            )
            await self.update_personal_info(db, resume_id=resume_id, personal_info=personal_info_update)
        
        # Update contacts
        if resume_update.contacts is not None:
            await self.update_contacts(db, resume_id=resume_id, contacts=resume_update.contacts)
        
        # Update skills
        if resume_update.skills is not None:
            await self.update_skills(db, resume_id=resume_id, skills=resume_update.skills)
        
        # Update experience
        if resume_update.experience is not None:
            await self.update_experience_list(db, resume_id=resume_id, experience_list=resume_update.experience)
        
        # Update education
        if resume_update.education is not None:
            await self.update_education_list(db, resume_id=resume_id, education_list=resume_update.education)
        
        # Return updated resume
        return await self.get_resume_by_id(db, resume_id=resume_id)

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

    async def update_contacts(self, db: AsyncSession, *, resume_id: int, contacts: List[str]) -> List[ResumeContact]:
        """Update all contacts for a resume by replacing existing ones"""
        # Remove existing contacts
        existing_contacts = await self.get_contacts(db, resume_id=resume_id)
        for contact in existing_contacts:
            await self.contact_crud.remove(db, id=contact.id)
        
        # Add new contacts
        new_contacts = []
        for contact_value in contacts:
            if contact_value.strip():  # Skip empty contacts
                new_contact = await self.add_contact(db, resume_id=resume_id, contact_value=contact_value.strip())
                new_contacts.append(new_contact)
        
        return new_contacts

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

    async def update_skills(self, db: AsyncSession, *, resume_id: int, skills: List[str]) -> List[ResumeSkill]:
        """Update all skills for a resume by replacing existing ones"""
        # Remove existing skills
        existing_skills = await self.get_skills(db, resume_id=resume_id)
        for skill in existing_skills:
            await self.skill_crud.remove(db, id=skill.id)
        
        # Add new skills
        new_skills = []
        for skill_name in skills:
            if skill_name.strip():  # Skip empty skills
                new_skill = await self.add_skill(db, resume_id=resume_id, skill_name=skill_name.strip())
                new_skills.append(new_skill)
        
        return new_skills

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

    async def update_experience(self, db: AsyncSession, *, resume_id: int, experience: List[Dict[str, Any]]) -> List[ResumeExperience]:
        """Update all experience for a resume by replacing existing ones"""
        # Remove existing experience
        existing_experience = await self.get_experience(db, resume_id=resume_id)
        for exp in existing_experience:
            await self.experience_crud.remove(db, id=exp.id)
        
        # Add new experience
        new_experience = []
        for exp_data in experience:
            if exp_data.get('job_title') and exp_data.get('company'):  # Skip incomplete experience
                # Convert date strings to date objects
                start_date = None
                end_date = None
                
                if exp_data.get('start_date'):
                    try:
                        start_date = datetime.strptime(exp_data['start_date'], "%Y-%m-%d").date()
                    except (ValueError, TypeError):
                        pass
                
                if exp_data.get('end_date'):
                    try:
                        end_date = datetime.strptime(exp_data['end_date'], "%Y-%m-%d").date()
                    except (ValueError, TypeError):
                        pass
                
                experience_create = ResumeExperienceCreate(
                    job_title=exp_data['job_title'],
                    company=exp_data['company'],
                    location=exp_data.get('location'),
                    start_date=start_date,
                    end_date=end_date,
                    responsibilities=exp_data.get('responsibilities', [])
                )
                new_exp = await self.add_experience(db, resume_id=resume_id, experience_data=experience_create)
                new_experience.append(new_exp)
        
        return new_experience

    async def update_experience_list(self, db: AsyncSession, *, resume_id: int, experience_list: List[UnifiedResumeExperience]) -> List[ResumeExperience]:
        """Update all experience for a resume using UnifiedResumeExperience objects"""
        # Remove existing experience
        existing_experience = await self.get_experience(db, resume_id=resume_id)
        for exp in existing_experience:
            await self.experience_crud.remove(db, id=exp.id)
        
        # Add new experience
        new_experience = []
        for exp_data in experience_list:
            if exp_data.job_title and exp_data.company:  # Skip incomplete experience
                experience_create = ResumeExperienceCreate(
                    job_title=exp_data.job_title,
                    company=exp_data.company,
                    location=exp_data.location,
                    start_date=exp_data.start_date,
                    end_date=exp_data.end_date,
                    responsibilities=exp_data.responsibilities
                )
                new_exp = await self.add_experience(db, resume_id=resume_id, experience_data=experience_create)
                new_experience.append(new_exp)
        
        return new_experience

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

    async def update_education_list(self, db: AsyncSession, *, resume_id: int, education_list: List[UnifiedResumeEducation]) -> List[ResumeEducation]:
        """Update all education for a resume using UnifiedResumeEducation objects"""
        # Remove existing education
        existing_education = await self.get_education(db, resume_id=resume_id)
        for edu in existing_education:
            await self.education_crud.remove(db, id=edu.id)
        
        # Add new education
        new_education = []
        for edu_data in education_list:
            if edu_data.degree and edu_data.institution:  # Skip incomplete education
                education_create = ResumeEducationCreate(
                    degree=edu_data.degree,
                    institution=edu_data.institution,
                    location=edu_data.location,
                    graduation_date=edu_data.graduation_date
                )
                new_edu = await self.add_education(db, resume_id=resume_id, education_data=education_create)
                new_education.append(new_edu)
        
        return new_education

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
