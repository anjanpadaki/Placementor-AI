from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from app.api import upload, chat, documents

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Reload the document list from Chroma so uploads survive restarts."""
    try:
        upload.load_documents_from_store()
        logger.info("Restored %d document(s) from Chroma", len(upload.documents_metadata))
    except Exception:
        logger.exception("Could not restore documents from Chroma")
    yield


app = FastAPI(title="PlaceMentor AI API", lifespan=lifespan)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(documents.router, prefix="/api", tags=["documents"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
