from fastapi import APIRouter, UploadFile, File
from typing import Dict, Any

router = APIRouter()


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...)
) -> Dict[str, Any]:
    """
    Upload resume file and return file ID.
    """
    # TODO: Implement actual file processing and storage
    # For now, return mocked ID as requested
    return {"id": "12345"}
