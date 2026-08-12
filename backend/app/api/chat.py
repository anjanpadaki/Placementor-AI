from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatQuery, ChatResponse
from app.rag.generator import generate_answer

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(query: ChatQuery):
    if not query.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    try:
        response = generate_answer(query.query)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
