from app.api.v1.endpoints import auth, health, resume, user, chat, template, test_pdf, ai
from fastapi import APIRouter

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(resume.router, prefix="/resume", tags=["resume"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(template.router, prefix="/template", tags=["template"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(test_pdf.router, tags=["test"])
