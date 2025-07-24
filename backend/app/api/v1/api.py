from app.api.v1.endpoints import auth, health, user
from fastapi import APIRouter

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(health.router)
