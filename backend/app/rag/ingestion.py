import os
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

def process_pdf(file_path: str, document_id: str):
    """
    Load a PDF and split it into chunks, attaching document_id metadata.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    loader = PyMuPDFLoader(file_path)
    documents = loader.load()
    
    if not documents:
        raise ValueError("No extractable text found in the PDF.")
    
    # Update metadata to include filename and document_id
    filename = os.path.basename(file_path)
    for doc in documents:
        # PyMuPDFLoader provides 'page' (0-indexed) or 'page_number' depending on version.
        # We ensure 'page' and 'filename' exist for our citation logic.
        page_num = doc.metadata.get('page', 0)
        doc.metadata['filename'] = filename
        doc.metadata['page'] = page_num + 1  # 1-indexed for humans
        doc.metadata['document_id'] = document_id
        
        # Clean up some heavy metadata if needed
        if 'source' in doc.metadata:
            del doc.metadata['source']
            
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    
    chunks = text_splitter.split_documents(documents)
    
    # Add chunk_id to each chunk
    for i, chunk in enumerate(chunks):
        chunk.metadata['chunk_id'] = f"{document_id}_chunk_{i}"
        
    return chunks, len(documents)
