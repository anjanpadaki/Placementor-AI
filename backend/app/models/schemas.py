from pydantic import BaseModel, Field
from typing import List, Optional

class ChatQuery(BaseModel):
    query: str

class Citation(BaseModel):
    filename: str
    page: int
    content: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[Citation]

class DocumentInfo(BaseModel):
    id: str
    filename: str
    size: int
    pages: int
    chunks: int
