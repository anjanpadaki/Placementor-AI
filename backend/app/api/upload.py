import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import settings
from app.rag.ingestion import process_pdf
from app.database.chroma import add_documents_to_store
from app.models.schemas import DocumentInfo

router = APIRouter()

# In-memory simple store for documents info (in a real app, use a DB)
documents_metadata = {}

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
        
        # Process PDF
        chunks, pages = process_pdf(file_path, document_id)
        
        # Store in vector DB
        add_documents_to_store(chunks)
        
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
