import os
from langchain_chroma import Chroma
from app.config import settings
from app.rag.embeddings import get_embeddings

def get_vector_store():
    embeddings = get_embeddings()
    os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
    
    vector_store = Chroma(
        collection_name="pdf_rag_collection",
        embedding_function=embeddings,
        persist_directory=settings.CHROMA_PERSIST_DIRECTORY
    )
    return vector_store

def add_documents_to_store(chunks):
    vector_store = get_vector_store()
    vector_store.add_documents(documents=chunks)

def delete_document_from_store(document_id: str):
    """
    Deletes all chunks associated with a specific document_id.
    """
    vector_store = get_vector_store()
    
    # We retrieve the collection to use the direct delete method with a where clause
    collection = vector_store._collection
    
    # ChromaDB delete supports where clause
    collection.delete(where={"document_id": document_id})
