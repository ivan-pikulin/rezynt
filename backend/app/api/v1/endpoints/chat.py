import logging
from typing import Any, Dict, List, Optional

from app.api.deps import VerifiedUser, get_db
from app.core.config import settings
from app.database.crud.crud_chat import chat_message_manager
from app.database.crud.crud_resume import resume_manager
from app.database.models import MessageRole
from app.schemas.resume import UnifiedResume, ChatResumeResponse, ResumeUpdates
from app.services.openai_service import ResumeChatService
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)
router = APIRouter()


class SendMessageRequest(BaseModel):
    message: str
    resume_id: int


class ChatResponse(BaseModel):
    message: str
    resume_updates: Optional[ResumeUpdates] = None


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
    unified_resume = await resume_manager.get_resume_by_id(db, resume_id=request.resume_id)
    if not unified_resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Log resume data for debugging
    logger.info(f"Retrieved resume: ID={unified_resume.id}, Title='{unified_resume.title}'")
    logger.info(f"Resume has {len(unified_resume.experience)} experience, {len(unified_resume.education)} education")
    logger.info(f"Resume has {len(unified_resume.skills)} skills, {len(unified_resume.contacts)} contacts")
    
    # Check that resume belongs to user
    if unified_resume.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    chat_history = await _get_chat_history(db, request.resume_id, settings.CHAT_HISTORY_MESSAGES_LIMIT)

    chat_service = ResumeChatService()
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
        # Get SQLAlchemy model for updates
        db_resume = await resume_manager.resume_crud.get_db_model_by_id(db, resume_id=request.resume_id)
        if db_resume:
            await _apply_resume_updates(db, db_resume, chat_response.resume_updates)

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


async def _apply_resume_updates(db: AsyncSession, resume_obj, updates):
    """
    Applies updates to resume in database
    """
    # Update main resume fields
    if updates.professional_summary is not None:
        resume_obj.professional_summary = updates.professional_summary

    # Update personal information
    if any(getattr(updates, field) is not None for field in ["first_name", "last_name", "location"]):
        if not resume_obj.personal_info:
            from app.database.models import ResumePersonalInfo
            personal_info = ResumePersonalInfo(resume_id=resume_obj.id)
            db.add(personal_info)
            await db.flush()  # Get ID
            resume_obj.personal_info = personal_info

        if updates.first_name is not None:
            resume_obj.personal_info.first_name = updates.first_name
        if updates.last_name is not None:
            resume_obj.personal_info.last_name = updates.last_name
        if updates.location is not None:
            resume_obj.personal_info.location = updates.location

    # Update contacts
    if updates.contacts is not None:
        # Remove old contacts
        for contact in resume_obj.contacts:
            await db.delete(contact)

        # Add new ones
        from app.database.models import ResumeContact
        for contact_value in updates.contacts:
            new_contact = ResumeContact(
                resume_id=resume_obj.id, value=contact_value)
            db.add(new_contact)

    # Update skills
    if updates.skills is not None:
        # Remove old skills
        for skill in resume_obj.skills:
            await db.delete(skill)

        # Add new ones
        from app.database.models import ResumeSkill
        for skill_name in updates.skills:
            new_skill = ResumeSkill(resume_id=resume_obj.id, name=skill_name)
            db.add(new_skill)

    # Update work experience
    if updates.experience is not None:
        # Remove old experience
        for exp in resume_obj.experience:
            await db.delete(exp)

        # Add new ones
        from app.database.models import ResumeExperience
        for exp_data in updates.experience:
            new_exp = ResumeExperience(
                resume_id=resume_obj.id,
                job_title=exp_data.job_title,
                company=exp_data.company,
                location=exp_data.location,
                start_date=exp_data.start_date,
                end_date=exp_data.end_date,
                responsibilities=exp_data.responsibilities or []
            )
            db.add(new_exp)

    # Update education
    if updates.education is not None:
        # Remove old education
        for edu in resume_obj.education:
            await db.delete(edu)

        # Add new ones
        from app.database.models import ResumeEducation
        for edu_data in updates.education:
            new_edu = ResumeEducation(
                resume_id=resume_obj.id,
                degree=edu_data.degree,
                institution=edu_data.institution,
                location=edu_data.location,
                graduation_date=edu_data.graduation_date
            )
            db.add(new_edu)
