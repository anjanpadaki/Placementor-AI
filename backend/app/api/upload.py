import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.config import settings
from app.rag.ingestion import process_pdf
from app.database.chroma import add_documents_to_store, get_all_chunk_metadata
from app.models.schemas import DocumentInfo

router = APIRouter()

# In-memory index of uploaded documents. Rebuilt from Chroma on startup
# (see load_documents_from_store) so it survives server restarts.
documents_metadata = {}


def load_documents_from_store():
    """Rebuild documents_metadata from the chunk metadata persisted in Chroma."""
    grouped = {}
    for meta in get_all_chunk_metadata():
        if not meta or "document_id" not in meta:
            continue
        doc_id = meta["document_id"]
        entry = grouped.setdefault(doc_id, {"filename": meta.get("filename", "Unknown"), "pages": 0, "chunks": 0})
        entry["pages"] = max(entry["pages"], int(meta.get("page", 0)))
        entry["chunks"] += 1

    documents_metadata.clear()
    for doc_id, entry in grouped.items():
        # Older uploads stored the UUID-prefixed disk name as the filename.
        filename = entry["filename"].removeprefix(f"{doc_id}_")
        file_path = os.path.join(settings.UPLOAD_DIRECTORY, f"{doc_id}_{filename}")
        size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
        documents_metadata[doc_id] = DocumentInfo(
            id=doc_id, filename=filename, size=size, pages=entry["pages"], chunks=entry["chunks"]
        )


def process_and_store_pdf(file_path: str, document_id: str, filename: str):
    """Run CPU-bound extraction and indexing away from FastAPI's event loop."""
    chunks, pages = process_pdf(file_path, document_id, filename)
    add_documents_to_store(chunks)
    return chunks, pages

@router.post("/upload", response_model=DocumentInfo)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)
    
    document_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOAD_DIRECTORY, f"{document_id}_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_size = os.path.getsize(file_path)
        
        # PDF extraction and embedding are CPU-bound operations.
        chunks, pages = await run_in_threadpool(
            process_and_store_pdf, file_path, document_id, file.filename
        )
        
        doc_info = DocumentInfo(
            id=document_id,
            filename=file.filename,
            size=file_size,
            pages=pages,
            chunks=len(chunks)
        )
        
        # Store metadata
        documents_metadata[document_id] = doc_info
        
        return doc_info
        
    except ValueError as e:
        # Cleanup file if processing failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
