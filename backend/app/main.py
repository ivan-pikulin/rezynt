import logging
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.api.v1.api import api_router
from app.database.models.base import setup_relationships

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Setup all relationships after all models are imported
setup_relationships()

class ForwardedProtocolMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Get the forwarded protocol from headers
        forwarded_proto = request.headers.get("x-forwarded-proto", "http")
        # Set the scheme in the request scope
        request.scope["scheme"] = forwarded_proto
        response = await call_next(request)
        return response

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Family Tree API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Add forwarded protocol middleware
app.add_middleware(ForwardedProtocolMiddleware)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)
