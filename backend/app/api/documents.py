import os
from typing import List
from fastapi import APIRouter, HTTPException
from app.models.schemas import DocumentInfo
from app.api.upload import documents_metadata
from app.database.chroma import delete_document_from_store
from app.config import settings

router = APIRouter()

@router.get("/documents", response_model=List[DocumentInfo])
async def list_documents():
    return list(documents_metadata.values())

@router.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    if document_id not in documents_metadata:
        raise HTTPException(status_code=404, detail="Document not found")
        
    try:
        # Delete from ChromaDB
        delete_document_from_store(document_id)
        
        # Delete file from disk
        doc_info = documents_metadata[document_id]
        file_path = os.path.join(settings.UPLOAD_DIRECTORY, f"{document_id}_{doc_info.filename}")
        if os.path.exists(file_path):
            os.remove(file_path)
            
        # Delete from in-memory metadata
        del documents_metadata[document_id]
        
        return {"status": "success", "message": "Document deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
