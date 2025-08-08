from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring and deployment verification.
    """
    return {"status": "healthy", "message": "API is running"}
