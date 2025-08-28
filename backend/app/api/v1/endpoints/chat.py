from typing import Any, Dict, List, Optional

from app.api.deps import VerifiedUser, get_db
from app.core.config import settings
from app.database.crud.crud_resume import resume_manager
from app.database.crud.crud_chat import chat_message_manager
from app.database.models import MessageRole
from app.schemas.resume import UnifiedResume
from app.services.openai_service import ResumeChatService
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


class SendMessageRequest(BaseModel):
    message: str
    resume_id: int


class ChatResponse(BaseModel):
    message: str
    resume_updates: Optional[Dict[str, Any]] = None


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: str


class MessageListResponse(BaseModel):
    messages: List[MessageResponse]
    total_count: int
    has_more: bool
    limit: int
    offset: int


@router.post("/send-message", response_model=ChatResponse)
async def send_message(
    request: SendMessageRequest,
    user: VerifiedUser,
    db: AsyncSession = Depends(get_db)
) -> ChatResponse:
    """
    Send message to chat with resume via OpenAI.
    """
    # Get resume
    resume_obj = await resume_manager.get_resume_by_id(db, resume_id=request.resume_id)
    if not resume_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Check that resume belongs to user
    if resume_obj.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get recent messages for context
    chat_history = await _get_chat_history(db, request.resume_id, settings.CHAT_HISTORY_MESSAGES_LIMIT)
    
    # Convert resume to UnifiedResume
    unified_resume = await _convert_to_unified_resume(resume_obj)
    
    # Create chat service
    chat_service = ResumeChatService()
    
    # Send message to OpenAI
    chat_response = await chat_service.chat_with_resume(
        user_message=request.message,
        resume=unified_resume,
        chat_history=chat_history
    )
    
    # Save user message
    await chat_message_manager.create_message(
        db=db,
        resume_id=request.resume_id,
        role=MessageRole.USER,
        content=request.message
    )
    
    # Save AI response
    await chat_message_manager.create_message(
        db=db,
        resume_id=request.resume_id,
        role=MessageRole.AI,
        content=chat_response.message
    )
    
    # Apply resume updates if any
    if chat_response.resume_updates:
        await _apply_resume_updates(db, resume_obj, chat_response.resume_updates)
    
    await db.commit()
    
    return ChatResponse(
        message=chat_response.message,
        resume_updates=chat_response.resume_updates
    )


@router.get("/messages/{resume_id}", response_model=MessageListResponse)
async def get_messages(
    resume_id: int,
    user: VerifiedUser,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0)
) -> MessageListResponse:
    """
    Get chat messages for a specific resume.
    """
    # Get resume
    resume_obj = await resume_manager.get_resume_by_id(db, resume_id=resume_id)
    if not resume_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Check that resume belongs to user
    if resume_obj.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get messages using CRUD
    messages = await chat_message_manager.get_messages(
        db=db,
        resume_id=resume_id,
        limit=limit,
        offset=offset
    )
    
    # Convert to API format
    message_list = []
    for msg in messages:
        message_list.append(MessageResponse(
            id=msg.id,
            role=msg.role.value,
            content=msg.content,
            created_at=msg.created_at.isoformat()
        ))
    
    # Get total message count
    total_count = await chat_message_manager.get_message_count(db=db, resume_id=resume_id)
    
    return MessageListResponse(
        messages=message_list,
        total_count=total_count,
        has_more=offset + len(messages) < total_count,
        limit=limit,
        offset=offset
    )


async def _get_chat_history(db: AsyncSession, resume_id: int, limit: int) -> List[Dict[str, str]]:
    """
    Gets recent chat messages for context
    """
    # Get recent messages in chronological order
    messages = await chat_message_manager.get_recent_messages(
        db=db,
        resume_id=resume_id,
            limit=limit
        )
    
    # Convert to OpenAI format
    history = []
    for msg in messages:
        history.append({
            "role": msg.role.value,
            "content": msg.content
        })
    
    return history


async def _convert_to_unified_resume(resume_obj) -> UnifiedResume:
    """
    Converts resume object from DB to UnifiedResume
    """
    # Collect data from related tables
    personal_info = resume_obj.personal_info
    contacts = [contact.value for contact in resume_obj.contacts]
    skills = [skill.name for skill in resume_obj.skills]
    
    experience = []
    for exp in resume_obj.experience:
        experience.append({
            "job_title": exp.job_title,
            "company": exp.company,
            "location": exp.location,
            "start_date": exp.start_date,
            "end_date": exp.end_date,
            "responsibilities": exp.responsibilities or []
        })
    
    education = []
    for edu in resume_obj.education:
        education.append({
            "degree": edu.degree,
            "institution": edu.institution,
            "location": edu.location,
            "graduation_date": edu.graduation_date
        })
    
    return UnifiedResume(
        id=resume_obj.id,
        user_id=resume_obj.user_id,
        title=resume_obj.title,
        template_id=resume_obj.template_id,
        professional_summary=resume_obj.professional_summary,
        conversation_id=resume_obj.conversation_id,
        from_upload=resume_obj.from_upload,
        created_at=resume_obj.created_at,
        updated_at=resume_obj.updated_at,
        first_name=personal_info.first_name if personal_info else None,
        last_name=personal_info.last_name if personal_info else None,
        location=personal_info.location if personal_info else None,
        contacts=contacts,
        skills=skills,
        experience=experience,
        education=education
    )


async def _apply_resume_updates(db: AsyncSession, resume_obj, updates: Dict[str, Any]):
    """
    Applies updates to resume in database
    """
    # Update main resume fields
    if "professional_summary" in updates:
        resume_obj.professional_summary = updates["professional_summary"]
    
    # Update personal information
    if any(field in updates for field in ["first_name", "last_name", "location"]):
        if not resume_obj.personal_info:
            from app.database.models import ResumePersonalInfo
            personal_info = ResumePersonalInfo(resume_id=resume_obj.id)
            db.add(personal_info)
            await db.flush()  # Get ID
            resume_obj.personal_info = personal_info
        
        if "first_name" in updates:
            resume_obj.personal_info.first_name = updates["first_name"]
        if "last_name" in updates:
            resume_obj.personal_info.last_name = updates["last_name"]
        if "location" in updates:
            resume_obj.personal_info.location = updates["location"]
    
    # Update contacts
    if "contacts" in updates:
        # Remove old contacts
        for contact in resume_obj.contacts:
            await db.delete(contact)
        
        # Add new ones
        from app.database.models import ResumeContact
        for contact_value in updates["contacts"]:
            new_contact = ResumeContact(resume_id=resume_obj.id, value=contact_value)
            db.add(new_contact)
    
    # Update skills
    if "skills" in updates:
        # Remove old skills
        for skill in resume_obj.skills:
            await db.delete(skill)
        
        # Add new ones
        from app.database.models import ResumeSkill
        for skill_name in updates["skills"]:
            new_skill = ResumeSkill(resume_id=resume_obj.id, name=skill_name)
            db.add(new_skill)
    
    # Update work experience
    if "experience" in updates:
        # Remove old experience
        for exp in resume_obj.experience:
            await db.delete(exp)
        
        # Add new ones
        from app.database.models import ResumeExperience
        for exp_data in updates["experience"]:
            new_exp = ResumeExperience(
                resume_id=resume_obj.id,
                job_title=exp_data["job_title"],
                company=exp_data["company"],
                location=exp_data.get("location"),
                start_date=exp_data.get("start_date"),
                end_date=exp_data.get("end_date"),
                responsibilities=exp_data.get("responsibilities", [])
            )
            db.add(new_exp)
    
    # Update education
    if "education" in updates:
        # Remove old education
        for edu in resume_obj.education:
            await db.delete(edu)
        
        # Add new ones
        from app.database.models import ResumeEducation
        for edu_data in updates["education"]:
            new_edu = ResumeEducation(
                resume_id=resume_obj.id,
                degree=edu_data["degree"],
                institution=edu_data["institution"],
                location=edu_data.get("location"),
                graduation_date=edu_data.get("graduation_date")
            )
            db.add(new_edu)